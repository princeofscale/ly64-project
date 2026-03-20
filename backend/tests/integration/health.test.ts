/**
 * Health Check API Integration Tests
 *
 * Tests for the basic health check endpoints that don't require database.
 */

import express from 'express';
import request from 'supertest';

// Create a simple test app that mimics the health endpoints
const createTestApp = () => {
  const app = express();

  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'API is running',
      dev: 'princeofscale',
      telegram: '@tqwit',
    });
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Lyceum 64 API is running',
    });
  });

  return app;
};

describe('Health Check Endpoints', () => {
  const app = createTestApp();

  describe('GET /', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return ok status in body', async () => {
      const response = await request(app).get('/');

      expect(response.body.status).toBe('ok');
    });

    it('should return correct message', async () => {
      const response = await request(app).get('/');

      expect(response.body.message).toBe('API is running');
    });

    it('should include developer info', async () => {
      const response = await request(app).get('/');

      expect(response.body.dev).toBe('princeofscale');
      expect(response.body.telegram).toBe('@tqwit');
    });

    it('should have all required fields', async () => {
      const response = await request(app).get('/');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('dev');
      expect(response.body).toHaveProperty('telegram');
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return ok status in body', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.status).toBe('ok');
    });

    it('should return correct message', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body.message).toBe('Lyceum 64 API is running');
    });

    it('should have status and message fields', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Response time', () => {
    it('should respond within 100ms', async () => {
      const start = Date.now();
      await request(app).get('/api/health');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('HTTP methods', () => {
    it('should handle GET request', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should return 404 for POST to health endpoint', async () => {
      const response = await request(app).post('/api/health');
      expect(response.status).toBe(404);
    });

    it('should return 404 for PUT to health endpoint', async () => {
      const response = await request(app).put('/api/health');
      expect(response.status).toBe(404);
    });

    it('should return 404 for DELETE to health endpoint', async () => {
      const response = await request(app).delete('/api/health');
      expect(response.status).toBe(404);
    });
  });
});
