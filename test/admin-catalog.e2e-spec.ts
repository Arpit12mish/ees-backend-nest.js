import {
  E2eApp,
  createE2eApp,
  expectSuccessEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
} from './e2e-utils';

describe('Admin catalog (e2e)', () => {
  let ctx: E2eApp;
  let token: string;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    token = await loginAdmin(ctx.api);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('creates and publishes catalog entities, images, and collection links', async () => {
    const category = await ctx.api
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Admin E2E Category',
        slug: 'admin-e2e-category',
        isActive: true,
      })
      .expect(201);
    expectSuccessEnvelope(category.body);

    const product = await ctx.api
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Admin E2E Product',
        slug: 'admin-e2e-product',
        sku: 'ADMIN-E2E-001',
        price: 600,
        mrp: 800,
        categoryId: category.body.data.id,
        inventoryQuantity: 5,
        lowStockThreshold: 2,
        status: 'DRAFT',
        shortDescription: 'Traditionally associated with focus and calm.',
      })
      .expect(201);
    expectSuccessEnvelope(product.body);

    const updatedProduct = await ctx.api
      .patch(`/api/admin/products/${product.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ shortDescription: 'Often chosen for a calm space.', priority: 9 })
      .expect(200);
    expect(updatedProduct.body.data.shortDescription).toBe(
      'Often chosen for a calm space.',
    );

    await ctx.api
      .patch(`/api/admin/products/${product.body.data.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PUBLISHED' })
      .expect(200);

    const imageOne = await ctx.api
      .post(`/api/admin/products/${product.body.data.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        imageUrl: 'https://example.com/admin-e2e-1.jpg',
        altText: 'Admin E2E first image',
      })
      .expect(201);
    expect(imageOne.body.data.isPrimary).toBe(true);

    const imageTwo = await ctx.api
      .post(`/api/admin/products/${product.body.data.id}/images`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        imageUrl: 'https://example.com/admin-e2e-2.jpg',
        altText: 'Admin E2E second image',
      })
      .expect(201);

    await ctx.api
      .patch(`/api/admin/product-images/${imageTwo.body.data.id}/primary`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const collection = await ctx.api
      .post('/api/admin/collections')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Admin E2E Collection',
        slug: 'admin-e2e-collection',
        isActive: true,
      })
      .expect(201);

    await ctx.api
      .post(`/api/admin/collections/${collection.body.data.id}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product.body.data.id, sortOrder: 3 })
      .expect(201);

    const sorted = await ctx.api
      .patch(
        `/api/admin/collections/${collection.body.data.id}/products/${product.body.data.id}/sort-order`,
      )
      .set('Authorization', `Bearer ${token}`)
      .send({ sortOrder: 1 })
      .expect(200);
    expect(sorted.body.data.sortOrder).toBe(1);

    const publicProduct = await ctx.api
      .get('/api/public/products/admin-e2e-product')
      .expect(200);
    expect(publicProduct.body.data.slug).toBe('admin-e2e-product');

    await ctx.api
      .delete(`/api/admin/products/${product.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await ctx.api.get('/api/public/products/admin-e2e-product').expect(404);
  });
});
