import {
  E2eApp,
  createE2eApp,
  expectSuccessEnvelope,
  resetDatabase,
  seedCatalog,
} from './e2e-utils';

describe('Public catalog (e2e)', () => {
  let ctx: E2eApp;
  let catalog: Awaited<ReturnType<typeof seedCatalog>>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    catalog = await seedCatalog(ctx.prisma);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('lists only active categories', async () => {
    const response = await ctx.api.get('/api/public/categories').expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=600, s-maxage=86400, stale-while-revalidate=604800',
    );
    const slugs = response.body.data.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(catalog.activeCategory.slug);
    expect(slugs).not.toContain(catalog.inactiveCategory.slug);
  });

  it('lists only published products in active categories', async () => {
    const response = await ctx.api.get('/api/public/products').expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    );
    const slugs = response.body.data.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(catalog.product.slug);
    expect(slugs).toContain(catalog.outOfStockProduct.slug);
    expect(slugs).not.toContain(catalog.draftProduct.slug);
    expect(slugs).not.toContain(catalog.hiddenCategoryProduct.slug);
  });

  it('returns product detail with category, images, primaryImage, attributes, and seoMetadata', async () => {
    const response = await ctx.api
      .get(`/api/public/products/${catalog.product.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        slug: catalog.product.slug,
        category: expect.objectContaining({
          slug: catalog.activeCategory.slug,
        }),
        images: expect.any(Array),
        primaryImage: expect.objectContaining({
          isPrimary: true,
          thumbnailUrl: 'https://example.com/e2e-rose-primary-thumb.webp',
          cardUrl: 'https://example.com/e2e-rose-primary-card.webp',
          detailUrl: 'https://example.com/e2e-rose-primary-detail.webp',
        }),
        attributes: expect.objectContaining({ stoneType: 'Rose Quartz' }),
        seoMetadata: null,
      }),
    );
  });

  it('returns featured products from active best-sellers collection', async () => {
    const response = await ctx.api
      .get('/api/public/products/featured')
      .expect(200);
    expectSuccessEnvelope(response.body);
    const slugs = response.body.data.map((item: { slug: string }) => item.slug);
    expect(slugs).toContain(catalog.product.slug);
    expect(slugs).not.toContain(catalog.draftProduct.slug);
  });

  it('search does not expose inactive or draft products', async () => {
    const response = await ctx.api
      .get('/api/public/products/search?q=rose')
      .expect(200);
    expectSuccessEnvelope(response.body);
    const slugs = response.body.data.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(catalog.product.slug);
    expect(slugs).not.toContain(catalog.draftProduct.slug);
    expect(slugs).not.toContain(catalog.hiddenCategoryProduct.slug);
  });

  it('category product route returns only public products', async () => {
    const response = await ctx.api
      .get(`/api/public/products/category/${catalog.activeCategory.slug}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    const slugs = response.body.data.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(catalog.product.slug);
    expect(slugs).not.toContain(catalog.draftProduct.slug);
  });

  it('lists only active collections and returns active collection detail', async () => {
    const list = await ctx.api.get('/api/public/collections').expect(200);
    expectSuccessEnvelope(list.body);
    const slugs = list.body.data.map((item: { slug: string }) => item.slug);
    expect(slugs).toContain(catalog.collection.slug);
    expect(slugs).not.toContain(catalog.inactiveCollection.slug);

    const detail = await ctx.api
      .get(`/api/public/collections/${catalog.collection.slug}`)
      .expect(200);
    expect(detail.body.data.slug).toBe(catalog.collection.slug);
    await ctx.api
      .get(`/api/public/collections/${catalog.inactiveCollection.slug}`)
      .expect(404);
  });

  it('collection products expose only published products in active categories', async () => {
    const response = await ctx.api
      .get(`/api/public/collections/${catalog.collection.slug}/products`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    const slugs = response.body.data.items.map(
      (item: { slug: string }) => item.slug,
    );
    expect(slugs).toContain(catalog.product.slug);
    expect(slugs).not.toContain(catalog.draftProduct.slug);
    expect(slugs).not.toContain(catalog.hiddenCategoryProduct.slug);
  });
});
