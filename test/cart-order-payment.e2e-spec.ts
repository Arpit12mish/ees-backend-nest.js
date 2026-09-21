import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
  seedCatalog,
} from './e2e-utils';

describe('Cart, orders, payments, and admin order lifecycle (e2e)', () => {
  let ctx: E2eApp;
  let token: string;
  let catalog: Awaited<ReturnType<typeof seedCatalog>>;

  beforeEach(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    catalog = await seedCatalog(ctx.prisma);
    token = await loginAdmin(ctx.api);
  });

  afterEach(async () => {
    await ctx.app.close();
  });

  it('supports add/get/update/remove/clear cart and rejects invalid products/quantities', async () => {
    const addToCart = await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'cart-e2e',
        productId: catalog.product.id,
        quantity: 2,
      })
      .expect(201);
    expect(addToCart.headers['cache-control']).toBe('no-store');

    const cart = await ctx.api.get('/api/cart/cart-e2e').expect(200);
    expectSuccessEnvelope(cart.body);
    expect(cart.body.data.itemCount).toBe(2);
    const itemId = cart.body.data.items[0].id;

    const updated = await ctx.api
      .patch(`/api/cart/items/${itemId}`)
      .send({ quantity: 3 })
      .expect(200);
    expect(updated.body.data.itemCount).toBe(3);

    await ctx.api.delete(`/api/cart/items/${itemId}`).expect(200);
    await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'cart-e2e',
        productId: catalog.product.id,
        quantity: 1,
      })
      .expect(201);
    await ctx.api.delete('/api/cart/cart-e2e/clear').expect(200);

    const invalidQuantity = await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'cart-e2e',
        productId: catalog.product.id,
        quantity: 0,
      })
      .expect(400);
    expectErrorEnvelope(invalidQuantity.body);

    await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'cart-e2e',
        productId: catalog.outOfStockProduct.id,
        quantity: 1,
      })
      .expect(400);

    await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'cart-e2e',
        productId: catalog.draftProduct.id,
        quantity: 1,
      })
      .expect(404);
  });

  it('creates order snapshots and verifies mock payment idempotently', async () => {
    await ctx.api
      .post('/api/cart/items')
      .send({
        sessionId: 'order-e2e',
        productId: catalog.product.id,
        quantity: 2,
        userEmail: 'buyer@example.com',
        userPhone: '+911234567890',
      })
      .expect(201);

    const order = await ctx.api
      .post('/api/orders')
      .send({
        sessionId: 'order-e2e',
        customerName: 'E2E Buyer',
        customerEmail: 'buyer@example.com',
        customerPhone: '+911234567890',
        shippingAddress: {
          line1: '123 Test Street',
          city: 'Mumbai',
          state: 'MH',
          pincode: '400001',
          country: 'India',
        },
      })
      .expect(201);
    expect(order.headers['cache-control']).toBe('no-store');
    expect(order.body.data.orderStatus).toBe('PENDING_PAYMENT');
    expect(order.body.data.paymentStatus).toBe('PENDING');
    expect(order.body.data.items[0].priceAtPurchase).toBe(500);

    const fetchedOrder = await ctx.api
      .get(`/api/orders/${order.body.data.orderNumber}`)
      .expect(200);
    expect(fetchedOrder.body.data.orderNumber).toBe(
      order.body.data.orderNumber,
    );

    await ctx.api
      .patch(`/api/admin/orders/${order.body.data.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SHIPPED' })
      .expect(400);

    const payment = await ctx.api
      .post('/api/payments/create')
      .send({ orderNumber: order.body.data.orderNumber })
      .expect(201);
    expect(payment.headers['cache-control']).toBe('no-store');
    expect(payment.body.data.providerPaymentId).toEqual(expect.any(String));

    const before = await ctx.prisma.product.findUniqueOrThrow({
      where: { id: catalog.product.id },
    });

    const verified = await ctx.api
      .post('/api/payments/verify')
      .send({
        orderNumber: order.body.data.orderNumber,
        mockPaymentId: payment.body.data.providerPaymentId,
      })
      .expect(201);
    expect(verified.headers['cache-control']).toBe('no-store');
    expect(verified.body.data.paymentStatus).toBe('SUCCESS');
    expect(verified.body.data.orderStatus).toBe('CONFIRMED');

    const after = await ctx.prisma.product.findUniqueOrThrow({
      where: { id: catalog.product.id },
    });
    expect(after.inventoryQuantity).toBe(before.inventoryQuantity - 2);

    const cart = await ctx.api.get('/api/cart/order-e2e').expect(200);
    expect(cart.body.data.items).toHaveLength(0);

    await ctx.api
      .post('/api/payments/verify')
      .send({
        orderNumber: order.body.data.orderNumber,
        mockPaymentId: payment.body.data.providerPaymentId,
      })
      .expect(201);
    const afterSecondVerify = await ctx.prisma.product.findUniqueOrThrow({
      where: { id: catalog.product.id },
    });
    expect(afterSecondVerify.inventoryQuantity).toBe(after.inventoryQuantity);

    const listed = await ctx.api
      .get('/api/admin/orders')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data.items.length).toBeGreaterThan(0);

    await ctx.api
      .get(`/api/admin/orders/${order.body.data.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await ctx.api
      .patch(`/api/admin/orders/${order.body.data.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PROCESSING', note: 'Packed' })
      .expect(200);

    await ctx.api
      .patch(`/api/admin/orders/${order.body.data.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'DELIVERED' })
      .expect(400);
  });
});
