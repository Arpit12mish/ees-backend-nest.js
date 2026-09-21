import {
  E2eApp,
  createE2eApp,
  expectSuccessEnvelope,
  resetDatabase,
} from './e2e-utils';

describe('Health (e2e)', () => {
  let ctx: E2eApp;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('GET /api/health returns app and database status', async () => {
    const response = await ctx.api.get('/api/health').expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data).toEqual({ status: 'ok', database: 'connected' });
  });
});
