import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
} from './e2e-utils';

const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
);

describe('Uploads (e2e)', () => {
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

  it('requires admin token', async () => {
    const response = await ctx.api
      .post('/api/admin/uploads/image')
      .attach('file', Buffer.from('not-image'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      })
      .expect(401);
    expectErrorEnvelope(response.body);
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('uploads a valid image and returns a stable URL', async () => {
    const response = await ctx.api
      .post('/api/admin/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', TINY_PNG, {
        filename: 'tiny.png',
        contentType: 'image/png',
      })
      .expect(201);
    expectSuccessEnvelope(response.body);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body.data).toEqual(
      expect.objectContaining({
        provider: 'local',
        storageKey: expect.stringMatching(
          /^products\/\d{4}\/\d{2}\/.+-detail\.webp$/,
        ),
        originalUrl: expect.stringMatching(/^\/uploads\/products\//),
        thumbnailUrl: expect.stringMatching(/-thumb\.webp$/),
        cardUrl: expect.stringMatching(/-card\.webp$/),
        detailUrl: expect.stringMatching(/-detail\.webp$/),
        width: expect.any(Number),
        height: expect.any(Number),
        mimeType: 'image/webp',
        size: expect.any(Number),
      }),
    );
  });

  it('rejects invalid file types and oversized files', async () => {
    await ctx.api
      .post('/api/admin/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('not-image'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      })
      .expect(400);

    await ctx.api
      .post('/api/admin/uploads/image')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.alloc(6 * 1024 * 1024), {
        filename: 'big.png',
        contentType: 'image/png',
      })
      .expect(400);
  });
});
