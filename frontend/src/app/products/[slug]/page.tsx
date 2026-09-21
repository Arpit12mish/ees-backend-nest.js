import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Container } from '@/components/common/Container';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductPrice } from '@/components/products/ProductPrice';
import { ReviewsSection } from '@/components/products/ReviewsSection';
import { FaqAccordion } from '@/components/faq/FaqAccordion';
import { JsonLd } from '@/components/seo/JsonLd';
import { TrackView } from '@/components/analytics/TrackView';
import { getProduct, getProductsByCategory } from '@/lib/api/products.api';
import { getProductSchema, getProductSeo } from '@/lib/api/seo.api';
import { getEntityFaqs } from '@/lib/api/faqs.api';
import { getGuides } from '@/lib/api/guides.api';
import { breadcrumbJsonLd, metadataFromSeo } from '@/lib/utils/seo';

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getProductSeo(slug).catch(() => null);
  return metadataFromSeo(seo, {
    title: 'Product',
    path: `/products/${slug}`,
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [product, schema] = await Promise.all([
    getProduct(slug).catch(() => null),
    getProductSchema(slug).catch(() => null),
  ]);

  if (!product) notFound();

  // Product-specific FAQs are rare; category-level ones (e.g. "What size are
  // your bracelets?") are almost always relevant on the product page too, so
  // surface both instead of leaving most product pages with none at all.
  const [productFaqs, categoryFaqs] = await Promise.all([
    getEntityFaqs('PRODUCT', product.id).catch(() => []),
    product.category
      ? getEntityFaqs('CATEGORY', product.category.id).catch(() => [])
      : Promise.resolve([]),
  ]);
  const faqs = [...productFaqs, ...categoryFaqs];
  const relatedGuides = product.category
    ? await getGuides({ tags: [product.category.slug], page: 1 })
        .then((r) => r.items.slice(0, 3))
        .catch(() => [])
    : [];
  const relatedProducts = product.category
    ? await getProductsByCategory(product.category.slug, { limit: 5, sort: 'priority' })
        .then((r) => r.items.filter((p) => p.id !== product.id).slice(0, 4))
        .catch(() => [])
    : [];

  const outOfStock = product.stockStatus === 'OUT_OF_STOCK';
  const attributes = product.attributes
    ? Object.entries(product.attributes).filter(([, value]) => value !== null && value !== undefined)
    : [];

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    ...(product.category
      ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
      : []),
    { label: product.name, href: `/products/${product.slug}` },
  ];

  return (
    <section className="py-6 sm:py-10">
      {schema ? <JsonLd data={schema} /> : null}
      <JsonLd data={breadcrumbJsonLd(breadcrumbItems)} />
      <TrackView type="PRODUCT_VIEW" productId={product.id} />
      <Container>
        <Breadcrumbs items={breadcrumbItems} />
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductImageGallery images={product.images} productName={product.name} />
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-white p-4 sm:p-6">
            {product.category ? (
              <p className="text-sm font-semibold text-[var(--accent)]">
                {product.category.name}
              </p>
            ) : null}
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-[#17201d] sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4">
              <ProductPrice
                price={product.price}
                mrp={product.mrp}
                discountPercent={product.discountPercent}
                currency={product.currency}
              />
            </div>
            <p className={`mt-3 text-sm font-semibold ${outOfStock ? 'text-red-700' : 'text-[var(--brand)]'}`}>
              {outOfStock ? 'Out of stock' : product.stockStatus === 'LOW_STOCK' ? 'Low stock' : 'In stock'}
            </p>
            {product.shortDescription ? (
              <p className="mt-5 text-base leading-7 text-[var(--muted)]">
                {product.shortDescription}
              </p>
            ) : null}
            <AddToCartButton productId={product.id} disabled={outOfStock} className="mt-6 max-w-sm" />
            <div className="mt-6 grid gap-3 rounded-md bg-[var(--soft)] p-4 text-sm leading-6 text-[#34413d]">
              <p>Secure mock checkout for development and testing.</p>
              <p>Inventory is reserved only after payment verification succeeds.</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            {[
              ['Product story', product.storySummary],
              ['Traditional associations', product.spiritualBenefitSummary],
              ['Usage guide', product.usageGuide],
              ['Care instructions', product.careInstructions],
              ['Details', product.longDescription],
            ].map(([title, copy]) =>
              copy ? (
                <section key={title} className="rounded-lg border border-[var(--border)] bg-white p-5">
                  <h2 className="text-lg font-semibold text-[#17201d]">{title}</h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{copy}</p>
                </section>
              ) : null,
            )}
          </div>
          {attributes.length ? (
            <aside className="rounded-lg border border-[var(--border)] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#17201d]">Attributes</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                {attributes.map(([key, value]) => (
                  <div key={key} className="grid gap-1 border-b border-[var(--border)] pb-3 last:border-0">
                    <dt className="font-semibold capitalize text-[#17201d]">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </dt>
                    <dd className="text-[var(--muted)]">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          ) : null}
        </div>

        {relatedProducts.length ? (
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-[#17201d]">You may also like</h2>
            <div className="mt-4">
              <ProductGrid products={relatedProducts} />
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-6">
          {relatedGuides.length ? (
            <section className="rounded-lg border border-[var(--border)] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#17201d]">Related guides</h2>
              <ul className="mt-3 grid gap-2">
                {relatedGuides.map((guide) => (
                  <li key={guide.id}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="font-semibold text-[var(--brand)] hover:underline"
                    >
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {faqs.length ? <FaqAccordion faqs={faqs} /> : null}
          <ReviewsSection productSlug={product.slug} />
        </div>
      </Container>
    </section>
  );
}
