import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ESP32_BASE_URL = process.env.ESP32_BASE_URL || 'http://192.168.4.1';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'water-bottle-telemetry-server',
    esp32Target: ESP32_BASE_URL,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Proxy GET /api/level or /api/status to ESP32
 */
async function proxyToEsp32(req, res, targetEndpoint) {
  const targetUrl = `${ESP32_BASE_URL}${targetEndpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const espResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!espResponse.ok) {
      return res.status(espResponse.status).json({
        error: `ESP32 returned HTTP ${espResponse.status}`,
        targetUrl,
      });
    }

    const data = await espResponse.json();
    return res.json(data);
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === 'AbortError';

    return res.status(isTimeout ? 504 : 502).json({
      error: isTimeout ? 'ESP32 Connection Timeout' : 'Unable to connect to ESP32',
      details: err instanceof Error ? err.message : String(err),
      targetUrl,
      hint: 'Verify device is powered and laptop is connected to SoftAP Wi-Fi "WaterBottle-Monitor"',
    });
  }
}

app.get('/api/level', (req, res) => proxyToEsp32(req, res, '/api/level'));
app.get('/api/status', (req, res) => proxyToEsp32(req, res, '/api/status'));

// Serve static frontend assets if built
const distPath = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

// SPA fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Water Bottle Monitoring Server is running. Run "npm run build:frontend" to serve UI here.');
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  WATER//LEVEL — IoT Backend & Proxy Server`);
    console.log(`  Listening on : http://localhost:${PORT}`);
    console.log(`  ESP32 Target : ${ESP32_BASE_URL}`);
    console.log(`=======================================================`);
  });
}

export default app;
