import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  resetDatabase,
  seedAdmin,
} from './e2e-utils';

describe('Admin auth (e2e)', () => {
  let ctx: E2eApp;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('logs in and returns an access token without passwordHash', async () => {
    const response = await ctx.api
      .post('/api/admin/auth/login')
      .send({ email: 'admin-e2e@example.com', password: 'Admin@123456' })
      .expect(201);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.admin).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'E2E Admin',
        email: 'admin-e2e@example.com',
        role: 'SUPER_ADMIN',
      }),
    );
    expect(response.body.data.admin.passwordHash).toBeUndefined();
  });

  it('returns current admin profile with token', async () => {
    const login = await ctx.api
      .post('/api/admin/auth/login')
      .send({ email: 'admin-e2e@example.com', password: 'Admin@123456' })
      .expect(201);

    const response = await ctx.api
      .get('/api/admin/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it('rejects protected admin API without token', async () => {
    const response = await ctx.api.get('/api/admin/categories').expect(401);
    expectErrorEnvelope(response.body);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('rejects invalid login with standard error envelope', async () => {
    const response = await ctx.api
      .post('/api/admin/auth/login')
      .send({ email: 'admin-e2e@example.com', password: 'wrong-password' })
      .expect(401);
    expectErrorEnvelope(response.body);
    expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
  });
});
