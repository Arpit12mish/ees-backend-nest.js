import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Case-insensitive substring match against each product's `attributes.intention`.
const COLLECTION_RULES: Record<string, string[]> = {
  'protection-essentials': ['protection', 'grounding', 'stability', 'strength'],
  'love-relationship-picks': ['love', 'compassion', 'self-love'],
  'money-attraction-picks': ['abundance', 'prosperity', 'wealth', 'opportunity'],
  'positive-energy-products': ['positive energy', 'joy', 'optimism', 'positivity', 'vitality'],
  'negative-energy-removal-products': ['cleansing', 'clearing'],
};

function normalizeIntention(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ').toLowerCase();
  if (typeof value === 'string') return value.toLowerCase();
  return '';
}

async function main() {
  // 1) Retire the duplicate legacy Rose Quartz Bracelet, superseded by a
  // newer product at the "rose-quartz-bracelet" slug (see prisma/seed.ts
  // for the full history — someone renamed the original demo product to
  // "-legacy" and added a real replacement with a new SKU).
  const legacy = await prisma.product.findUnique({
    where: { slug: 'rose-quartz-bracelet-legacy' },
  });
  if (legacy && legacy.status === 'PUBLISHED') {
    await prisma.product.update({
      where: { id: legacy.id },
      data: { status: 'INACTIVE' },
    });
    console.log('✓ Unpublished rose-quartz-bracelet-legacy (superseded product)');
  } else {
    console.log('ℹ️ rose-quartz-bracelet-legacy already inactive or not found');
  }

  // 2) Consolidate seven-chakra-bracelet into the main "Bracelet" category,
  // then retire "Crystal Bracelets" once it's empty (it duplicated the same
  // concept as the much larger "Bracelet" category from the newer catalog
  // import).
  const bracelet = await prisma.category.findUnique({ where: { slug: 'bracelet' } });
  const sevenChakra = await prisma.product.findUnique({
    where: { slug: 'seven-chakra-bracelet' },
  });
  if (bracelet && sevenChakra && sevenChakra.categoryId !== bracelet.id) {
    await prisma.product.update({
      where: { id: sevenChakra.id },
      data: { categoryId: bracelet.id },
    });
    console.log('✓ Moved seven-chakra-bracelet into the Bracelet category');
  }

  const crystalBracelets = await prisma.category.findUnique({
    where: { slug: 'crystal-bracelets' },
  });
  if (crystalBracelets) {
    const remaining = await prisma.product.count({
      where: { categoryId: crystalBracelets.id, status: 'PUBLISHED' },
    });
    if (remaining === 0) {
      await prisma.category.update({
        where: { id: crystalBracelets.id },
        data: { isActive: false },
      });
      console.log('✓ Deactivated now-empty Crystal Bracelets category');
    } else {
      console.log(`ℹ️ Crystal Bracelets still has ${remaining} product(s), left active`);
    }
  }

  // 3) Unpublish the leftover "API Test Product" debug artifact.
  const testProductResult = await prisma.product.updateMany({
    where: { sku: 'API-TEST-001', status: 'PUBLISHED' },
    data: { status: 'INACTIVE' },
  });
  if (testProductResult.count > 0) {
    console.log('✓ Unpublished the API Test Product debug artifact');
  }

  // 4) Deactivate categories with zero published products — these are
  // currently live, crawlable, empty category pages (thin content).
  const emptyCandidates = [
    'positive-energy',
    'love-relationship',
    'negative-energy-removal',
    'candles',
    'api-test-category',
  ];
  for (const slug of emptyCandidates) {
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category || !category.isActive) continue;
    const count = await prisma.product.count({
      where: { categoryId: category.id, status: 'PUBLISHED' },
    });
    if (count === 0) {
      await prisma.category.update({
        where: { id: category.id },
        data: { isActive: false },
      });
      console.log(`✓ Deactivated empty category: ${slug}`);
    }
  }

  // 5) Populate the intention-based collections from real attribute data so
  // they become genuine, keyword-targeted landing pages that cross-cut the
  // category structure (a product's category is single-select, but
  // collections are many-to-many — the right tool for "protection bracelet"
  // or "crystals for love" style search intent spanning multiple categories).
  const products = await prisma.product.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, attributes: true },
  });

  for (const [collectionSlug, keywords] of Object.entries(COLLECTION_RULES)) {
    const collection = await prisma.collection.findUnique({
      where: { slug: collectionSlug },
    });
    if (!collection) {
      console.warn(`⚠️ Collection not found: ${collectionSlug}`);
      continue;
    }

    const matches = products.filter((p) => {
      const attrs = (p.attributes ?? {}) as Record<string, unknown>;
      const intention = normalizeIntention(attrs.intention);
      return keywords.some((k) => intention.includes(k));
    });

    if (!matches.length) continue;

    const result = await prisma.collectionProduct.createMany({
      data: matches.map((p, index) => ({
        collectionId: collection.id,
        productId: p.id,
        sortOrder: index,
      })),
      skipDuplicates: true,
    });
    console.log(
      `✓ ${collectionSlug}: ${result.count} new product links added (${matches.length} matched total)`,
    );
  }

  console.log('\n✅ Category structure cleanup complete.');
}

main()
  .catch((e) => {
    console.error('❌ Cleanup failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
