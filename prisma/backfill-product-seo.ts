import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const BRAND_NAME = 'Enchanted Energy Store';
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000';

// Category slug -> natural-language noun used in generated copy.
const CATEGORY_NOUNS: Record<string, string> = {
  bracelet: 'bracelet',
  'crystal-bracelets': 'bracelet',
  'numerology-bracelet': 'numerology bracelet',
  'chakra-activation-bracelet': 'chakra bracelet',
  'pendulum-dowsing': 'dowsing pendulum',
};

function normalizeAttr(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const safe = lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced;
  return safe.trimEnd() + '…';
}

function getSeoImageUrl(image?: {
  detailUrl: string | null;
  cardUrl: string | null;
  imageUrl: string;
} | null): string {
  if (!image) return '';
  return image.detailUrl ?? image.cardUrl ?? image.imageUrl ?? '';
}

function buildProductSeo(product: {
  name: string;
  slug: string;
  attributes: unknown;
  category: { name: string; slug: string };
}) {
  const attrs = (product.attributes ?? {}) as Record<string, unknown>;
  const stoneTypes = normalizeAttr(attrs.stoneType);
  const stoneType = (stoneTypes[0] ?? product.name).replace(/^natural\s+/i, '');
  const chakras = normalizeAttr(attrs.chakra);
  const intentions = normalizeAttr(attrs.intention);
  const noun = CATEGORY_NOUNS[product.category.slug] ?? product.category.name.toLowerCase();

  // Prefer, in order: "Name — Intention | Brand", then "Name | Brand", then
  // the bare name (no brand suffix, since many real product names already
  // run 60-70+ chars and a mid-word-truncated name + brand tag reads worse
  // than the full name alone).
  const titleSuffix = ` | ${BRAND_NAME}`;
  const intentionForTitle = intentions.slice(0, 2).join(' & ');
  const withIntention = intentionForTitle ? `${product.name} — ${intentionForTitle}` : null;
  let seoTitle: string;
  if (withIntention && withIntention.length + titleSuffix.length <= 70) {
    seoTitle = withIntention + titleSuffix;
  } else if (product.name.length + titleSuffix.length <= 70) {
    seoTitle = product.name + titleSuffix;
  } else if (product.name.length <= 70) {
    seoTitle = product.name;
  } else {
    seoTitle = truncate(product.name, 70);
  }

  const descParts: string[] = [`Natural ${stoneType} ${noun}`];
  if (intentions.length) {
    descParts.push(`traditionally associated with ${intentions.slice(0, 3).join(', ').toLowerCase()}`);
  }
  const primaryChakra = chakras[0]?.toLowerCase().includes('chakra') ? chakras[0] : undefined;
  if (primaryChakra) {
    descParts.push(`aligned with the ${primaryChakra}`);
  }
  const seoDescription = truncate(descParts.join(', ') + '.', 160);

  const seoKeywords = Array.from(
    new Set([stoneType, ...intentions, ...chakras, product.category.name]),
  )
    .filter(Boolean)
    .join(', ');

  const canonicalUrl = `${FRONTEND_BASE_URL}/products/${product.slug}`;

  return { seoTitle, seoDescription, seoKeywords, canonicalUrl };
}

async function main() {
  const [allPublished, existingSeo] = await Promise.all([
    prisma.product.findMany({
      where: { status: 'PUBLISHED', sku: { not: 'API-TEST-001' } },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
      },
    }),
    prisma.seoMetadata.findMany({
      where: { entityType: 'PRODUCT' },
      select: { entityId: true },
    }),
  ]);

  const hasSeo = new Set(existingSeo.map((s) => s.entityId));
  const products = allPublished.filter((p) => !hasSeo.has(p.id));

  console.log(`Found ${products.length} published products with no SeoMetadata row.`);

  let created = 0;
  for (const product of products) {
    const { seoTitle, seoDescription, seoKeywords, canonicalUrl } = buildProductSeo(product);
    const ogImageUrl = getSeoImageUrl(product.images[0]);

    await prisma.seoMetadata.create({
      data: {
        entityType: 'PRODUCT',
        entityId: product.id,
        seoTitle,
        seoDescription,
        seoKeywords,
        canonicalUrl,
        ogTitle: seoTitle,
        ogDescription: seoDescription,
        ogImageUrl,
        twitterTitle: seoTitle,
        twitterDescription: seoDescription,
        twitterImageUrl: ogImageUrl,
        schemaType: 'Product',
      },
    });
    created += 1;
    console.log(`✓ ${product.slug}\n    title: ${seoTitle}\n    desc:  ${seoDescription}`);
  }

  console.log(`\n✅ Created ${created} SeoMetadata rows.`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
