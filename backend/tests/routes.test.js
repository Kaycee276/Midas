jest.mock('../src/services/public.service', () => ({
  getBusinessTypes: jest.fn().mockResolvedValue(['food', 'retail', 'tech']),
  getActiveMerchants: jest.fn().mockResolvedValue({ merchants: [], total: 0 }),
}));

jest.mock('../src/services/investment.service', () => ({
  getStudentRoi: jest.fn().mockResolvedValue({
    summary: {
      total_invested: 50000,
      current_portfolio_value: 58000,
      total_dividends_earned: 8000,
      net_capital_growth: 8000,
      total_net_profit: 16000,
      overall_roi_percentage: 32,
      active_holdings_count: 1,
      next_distribution_date: '2027-01-01T00:00:00.000Z',
      days_to_distribution: 68,
      annual_profit_pool_share: '30%',
    },
    holdings: [],
    payouts: [],
  }),
}));

const jwt = require('jsonwebtoken');
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

  describe('GET /api/investments/roi - Authentication & Authorization', () => {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-1234567890';

    it('should return 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/investments/roi');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No token provided/i);
    });

    it('should return 403 when accessed by merchant role', async () => {
      const token = jwt.sign({ id: 'm-1', email: 'm@test.com', type: 'merchant' }, secret);
      const res = await request(app)
        .get('/api/investments/roi')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Student access required/i);
    });

    it('should return 403 when accessed by admin role', async () => {
      const token = jwt.sign({ id: 'a-1', email: 'a@test.com', type: 'admin' }, secret);
      const res = await request(app)
        .get('/api/investments/roi')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Student access required/i);
    });

    it('should return 200 with ROI data when accessed by authorized student', async () => {
      const token = jwt.sign({ id: 's-1', email: 's@test.com', type: 'student' }, secret);
      const res = await request(app)
        .get('/api/investments/roi')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
      expect(res.body.data.summary.overall_roi_percentage).toBe(32);
      expect(res.body.data.summary.total_invested).toBe(50000);
    });
  });
});
