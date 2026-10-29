import http from 'http';

const PORT = 3001;
const USABLE_HEIGHT_CM = 17.0;
const SENSOR_OFFSET_CM = 2.0;

let currentDistance = 5.2; // default: ~70% full
let direction = 0.2;

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/level' || url.pathname === '/api/status') {
    // Gentle sine wave fluctuation for realistic live sensor feel
    currentDistance += direction;
    if (currentDistance >= USABLE_HEIGHT_CM - 0.5) {
      direction = -0.25;
    } else if (currentDistance <= SENSOR_OFFSET_CM + 0.5) {
      direction = 0.25;
    }

    const dist = Math.round(currentDistance * 10) / 10;
    const waterDepth = Math.max(0, Math.min(USABLE_HEIGHT_CM, USABLE_HEIGHT_CM - dist));
    const effectiveSpan = USABLE_HEIGHT_CM - SENSOR_OFFSET_CM;
    const pct = Math.max(0, Math.min(100, Math.round(((waterDepth / effectiveSpan) * 100) * 10) / 10));

    const payload = {
      device: 'WaterBottleMonitor [MOCK_HARDWARE]',
      online: true,
      status: 'LIVE',
      distanceCm: dist,
      waterLevelCm: Math.round(waterDepth * 10) / 10,
      fillPercent: pct,
      ageMs: Math.floor(Math.random() * 80) + 20,
      // snake_case firmware compatibility aliases
      distance_cm: dist,
      level_percent: Math.round(pct),
      valid: true,
      stale: false,
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload, null, 2));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found', available: ['/api/level', '/api/status'] }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  MOCK ESP32 SOFT-AP SERVER ACTIVE`);
  console.log(`  Emulating ESP32 HTTP JSON API on : http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`    - http://localhost:${PORT}/api/level`);
  console.log(`    - http://localhost:${PORT}/api/status`);
  console.log(`=======================================================`);
});
