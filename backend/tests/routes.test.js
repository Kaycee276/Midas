jest.mock('../src/services/public.service', () => ({
  getBusinessTypes: jest.fn().mockResolvedValue(['food', 'retail', 'tech']),
  getActiveMerchants: jest.fn().mockResolvedValue({ merchants: [], total: 0 }),
}));

const request = require('supertest');
const app = require('../src/config/app');

describe('API Route Integration / Endpoint Tests', () => {
  it('GET /health should return 200 and healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is healthy');
  });

  it('GET /api/health should return 200 and API health message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('API is healthy');
  });

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app).get('/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });

  it('GET /api/public/business-types should return business types list', async () => {
    const res = await request(app).get('/api/public/business-types');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.business_types)).toBe(true);
    expect(res.body.data.business_types.length).toBeGreaterThan(0);
  });

  it('POST /api/students/register with missing body should return 400 ValidationError', async () => {
    const res = await request(app).post('/api/students/register').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });
});
