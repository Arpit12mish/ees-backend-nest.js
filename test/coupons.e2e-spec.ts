import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
  seedCatalog,
} from './e2e-utils';

describe('Coupons (e2e)', () => {
  let ctx: E2eApp;
  let token: string;
  let catalog: Awaited<ReturnType<typeof seedCatalog>>;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    catalog = await seedCatalog(ctx.prisma);
    token = await loginAdmin(ctx.api);
    await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'coupon-cart',
        productId: catalog.product.id,
        quantity: 3,
      })
      .expect(201);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('applies percentage coupon with max discount and uppercase normalization', async () => {
    await ctx.api
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'save50',
        type: 'PERCENTAGE',
        value: 50,
        maxDiscountAmount: 100,
      })
      .expect(201);

    const response = await ctx.api
      .post('/api/coupons/validate')
      .send({ code: 'save50', sessionId: 'coupon-cart' })
      .expect(201);
    expect(response.body.data.code).toBe('SAVE50');
    expect(response.body.data.discountAmount).toBe(100);
  });

  it('applies FREE_SHIPPING coupon to cart totals', async () => {
    await ctx.api
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'SHIPFREE', type: 'FREE_SHIPPING', value: 0 })
      .expect(201);

    await ctx.api
      .post('/api/coupons/validate')
      .send({ code: 'shipfree', sessionId: 'coupon-cart' })
      .expect(201);
    const cart = await ctx.api.get('/api/cart/coupon-cart').expect(200);
    expect(cart.body.data.shippingAmount).toBe(0);
  });

  it('rejects expired, inactive, exceeded, and invalid coupons', async () => {
    await ctx.api
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'EXPIRED',
        type: 'FIXED_AMOUNT',
        value: 10,
        endDate: new Date(Date.now() - 86400000).toISOString(),
      })
      .expect(201);

    await ctx.api
      .post('/api/admin/coupons')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'INACTIVE',
        type: 'FIXED_AMOUNT',
        value: 10,
        isActive: false,
      })
      .expect(201);

    await ctx.prisma.coupon.create({
      data: {
        code: 'USEDUP',
        type: 'FIXED_AMOUNT',
        value: 10,
        usageLimit: 1,
        usedCount: 1,
        isActive: true,
      },
    });

    for (const code of ['EXPIRED', 'INACTIVE', 'USEDUP', 'MISSING']) {
      const response = await ctx.api
        .post('/api/coupons/validate')
        .send({ code, sessionId: 'coupon-cart' });
      expect([400, 404]).toContain(response.status);
      expectErrorEnvelope(response.body);
    }
  });
});
