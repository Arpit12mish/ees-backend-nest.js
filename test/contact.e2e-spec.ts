import {
  E2eApp,
  createE2eApp,
  expectErrorEnvelope,
  expectSuccessEnvelope,
  loginAdmin,
  resetDatabase,
  seedAdmin,
} from './e2e-utils';

describe('Contact (e2e)', () => {
  let ctx: E2eApp;
  let token: string;
  let leadId: string;

  beforeAll(async () => {
    ctx = await createE2eApp();
    await resetDatabase(ctx.prisma);
    await seedAdmin(ctx.prisma);
    token = await loginAdmin(ctx.api);
  });

  afterAll(async () => {
    await ctx.app.close();
  });

  it('submits a contact lead via public endpoint', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({
        name: 'Sunil',
        email: 'sunil@example.com',
        phone: '9999999999',
        subject: 'Product question',
        message: 'I want to know more about rose quartz bracelet.',
      })
      .expect(201);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.status).toBe('NEW');
    expect(response.body.data.name).toBe('Sunil');
    leadId = response.body.data.id as string;
  });

  it('submits without optional fields (phone, subject)', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({
        name: 'Priya',
        email: 'priya@example.com',
        message: 'Please share your catalogue for bulk orders.',
      })
      .expect(201);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.phone).toBeNull();
    expect(response.body.data.subject).toBeNull();
  });

  it('rejects a submission with missing name and message', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({ email: 'missing@example.com' })
      .expect(400);
    expectErrorEnvelope(response.body);
  });

  it('rejects an invalid email address', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({
        name: 'Test User',
        email: 'not-an-email',
        message: 'Valid message text here.',
      })
      .expect(400);
    expectErrorEnvelope(response.body);
  });

  it('rejects an invalid phone number', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: 'abc123',
        message: 'Valid message text here.',
      })
      .expect(400);
    expectErrorEnvelope(response.body);
  });

  it('rejects a message shorter than 10 characters', async () => {
    const response = await ctx.api
      .post('/api/public/contact')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hi',
      })
      .expect(400);
    expectErrorEnvelope(response.body);
  });

  it('lists contact leads via admin endpoint', async () => {
    const response = await ctx.api
      .get('/api/admin/contact-leads')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('fetches a single contact lead by id', async () => {
    const response = await ctx.api
      .get(`/api/admin/contact-leads/${leadId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.id).toBe(leadId);
    expect(response.body.data.email).toBe('sunil@example.com');
  });

  it('returns 404 for an unknown contact lead id', async () => {
    const response = await ctx.api
      .get('/api/admin/contact-leads/nonexistent-id')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expectErrorEnvelope(response.body);
    expect(response.body.errorCode).toBe('CONTACT_LEAD_NOT_FOUND');
  });

  it('updates contact lead status to CONTACTED', async () => {
    const response = await ctx.api
      .patch(`/api/admin/contact-leads/${leadId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'CONTACTED' })
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.status).toBe('CONTACTED');
  });

  it('updates contact lead status to SPAM', async () => {
    const response = await ctx.api
      .patch(`/api/admin/contact-leads/${leadId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'SPAM' })
      .expect(200);
    expectSuccessEnvelope(response.body);
    expect(response.body.data.status).toBe('SPAM');
  });

  it('rejects an invalid status value', async () => {
    const response = await ctx.api
      .patch(`/api/admin/contact-leads/${leadId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INVALID' })
      .expect(400);
    expectErrorEnvelope(response.body);
  });

  it('rejects admin endpoints without auth token', async () => {
    await ctx.api.get('/api/admin/contact-leads').expect(401);
    await ctx.api
      .patch(`/api/admin/contact-leads/${leadId}/status`)
      .send({ status: 'CLOSED' })
      .expect(401);
  });
});
