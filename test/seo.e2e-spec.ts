import {
  E2eApp,
  createE2eApp,
  expectSuccessEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
  seedCatalog,
} from './e2e-utils';

describe('SEO (e2e)', () => {
  let ctx: E2eApp;
  let catalog: Awaited<ReturnType<typeof seedCatalog>>;
  let token: string;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    catalog = await seedCatalog(ctx.prisma);
    token = await loginAdmin(ctx.api);
    await ctx.prisma.seoMetadata.create({
      data: {
        entityType: 'PRODUCT',
        entityId: catalog.product.id,
        seoTitle: 'Custom E2E Rose SEO',
        seoDescription: 'Custom safe SEO description for rose quartz.',
        seoKeywords: 'rose,e2e',
      },
    });
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('returns product SEO with metadata override', async () => {
    const response = await ctx.api
      .get(`/api/public/seo/product/${catalog.product.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
    );
    expect(response.body.data.title).toBe('Custom E2E Rose SEO');
    expect(response.body.data.canonicalUrl).toBe(
      `http://localhost:3000/products/${catalog.product.slug}`,
    );
  });

  it('returns category SEO fallback', async () => {
    const response = await ctx.api
      .get(`/api/public/seo/category/${catalog.activeCategory.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.title).toContain(catalog.activeCategory.name);
  });

  it('returns collection SEO fallback', async () => {
    const response = await ctx.api
      .get(`/api/public/seo/collection/${catalog.collection.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.title).toContain(catalog.collection.name);
  });

  it('returns product JSON-LD fields', async () => {
    const response = await ctx.api
      .get(`/api/public/seo/product-schema/${catalog.product.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: catalog.product.name,
        sku: catalog.product.sku,
        image: expect.any(Array),
        brand: expect.objectContaining({
          '@type': 'Brand',
          name: expect.any(String),
        }),
        offers: expect.objectContaining({
          '@type': 'Offer',
          price: '500.00',
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
        }),
      }),
    );
  });

  it('sitemap contains only public active/published URLs', async () => {
    const response = await ctx.api.get('/api/public/sitemap-data').expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=3600, s-maxage=86400',
    );
    const urls = response.body.data.map((item: { url: string }) => item.url);
    expect(urls).toContain(
      `http://localhost:3000/products/${catalog.product.slug}`,
    );
    expect(urls).toContain(
      `http://localhost:3000/categories/${catalog.activeCategory.slug}`,
    );
    expect(urls).toContain(
      `http://localhost:3000/collections/${catalog.collection.slug}`,
    );
    expect(urls).not.toContain(
      `http://localhost:3000/products/${catalog.draftProduct.slug}`,
    );
    expect(urls).not.toContain(
      `http://localhost:3000/categories/${catalog.inactiveCategory.slug}`,
    );
    expect(urls).not.toContain(
      `http://localhost:3000/collections/${catalog.inactiveCollection.slug}`,
    );
  });

  it('admin SEO creates, fetches, patches, and updates public SEO', async () => {
    const category = await ctx.prisma.category.create({
      data: {
        name: 'E2E SEO Category',
        slug: 'e2e-seo-category',
        isActive: true,
      },
    });
    const product = await ctx.prisma.product.create({
      data: {
        name: 'E2E SEO Product',
        slug: 'e2e-seo-product',
        sku: 'E2E-SEO-001',
        price: 250,
        mrp: 300,
        categoryId: category.id,
        status: 'PUBLISHED',
        stockStatus: 'IN_STOCK',
        inventoryQuantity: 3,
        publishedAt: new Date(),
      },
    });

    const created = await ctx.api
      .post('/api/admin/seo')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entityType: 'PRODUCT',
        entityId: product.id,
        seoTitle: 'Admin SEO Product',
        seoDescription: 'Safe admin SEO description.',
      })
      .expect(201);
    expectSuccessEnvelope(created.body);

    const entity = await ctx.api
      .get(`/api/admin/seo/entity/PRODUCT/${product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(entity.body.data.id).toBe(created.body.data.id);

    await ctx.api
      .patch(`/api/admin/seo/${created.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ seoTitle: 'Updated Admin SEO Product' })
      .expect(200);

    const publicSeo = await ctx.api
      .get(`/api/public/seo/product/${product.slug}`)
      .expect(200);
    expect(publicSeo.body.data.title).toBe('Updated Admin SEO Product');
  });
});
