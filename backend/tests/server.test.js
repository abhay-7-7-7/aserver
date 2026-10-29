import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

describe('Backend Server Tests', () => {
  it('GET /health returns status 200 and healthy JSON', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.service).toBe('water-bottle-telemetry-server');
  });

  it('sets CORS headers on requests', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });

  it('handles offline ESP32 gracefully without crashing', async () => {
    // When ESP32 is not running at 192.168.4.1, proxy should return 502 or 504 with descriptive hint
    const res = await request(app).get('/api/level');
    expect([502, 504]).toContain(res.status);
    expect(res.body.hint).toContain('WaterBottle-Monitor');
  });
});
