import {
  E2eApp,
  createE2eApp,
  loginAdmin,
  resetDatabase,
  seedAdmin,
  seedCatalog,
} from './e2e-utils';

describe('Inventory (e2e)', () => {
  let ctx: E2eApp;
  let token: string;
  let catalog: Awaited<ReturnType<typeof seedCatalog>>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    catalog = await seedCatalog(ctx.prisma);
    token = await loginAdmin(ctx.api);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('updates stock status based on inventory quantity and threshold', async () => {
    const out = await ctx.api
      .patch(`/api/admin/inventory/${catalog.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inventoryQuantity: 0, lowStockThreshold: 2 })
      .expect(200);
    expect(out.body.data.stockStatus).toBe('OUT_OF_STOCK');

    const low = await ctx.api
      .patch(`/api/admin/inventory/${catalog.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inventoryQuantity: 2, lowStockThreshold: 2 })
      .expect(200);
    expect(low.body.data.stockStatus).toBe('LOW_STOCK');

    const inStock = await ctx.api
      .patch(`/api/admin/inventory/${catalog.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inventoryQuantity: 8, lowStockThreshold: 2 })
      .expect(200);
    expect(inStock.body.data.stockStatus).toBe('IN_STOCK');
  });

  it('lists low stock and rejects negative inventory', async () => {
    await ctx.api
      .patch(`/api/admin/inventory/${catalog.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inventoryQuantity: 1, lowStockThreshold: 2 })
      .expect(200);

    const lowStock = await ctx.api
      .get('/api/admin/inventory/low-stock')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const ids = lowStock.body.data.map((item: { id: string }) => item.id);
    expect(ids).toContain(catalog.product.id);

    await ctx.api
      .patch(`/api/admin/inventory/${catalog.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ inventoryQuantity: -1, lowStockThreshold: 2 })
      .expect(400);
  });
});
