import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  resetDatabase,
} from './e2e-utils';

describe('App error envelope (e2e)', () => {
  let ctx: E2eApp;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('returns the standard validation error envelope', async () => {
    const response = await ctx.api.post('/api/cart/items').send({}).expect(400);
    expectErrorEnvelope(response.body);
    expect(response.body.path).toBe('/api/cart/items');
  });

  it('returns the standard not-found error envelope', async () => {
    const response = await ctx.api
      .get('/api/public/products/does-not-exist')
      .expect(404);
    expectErrorEnvelope(response.body);
    expect(response.body.errorCode).toBe('PRODUCT_NOT_FOUND');
  });
});
