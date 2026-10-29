# WATER//LEVEL — Live IoT Water Bottle Monitoring Website

A responsive, high-contrast **Neubrutalism UI** real-time liquid level dashboard built with **React 19**, **TypeScript**, **Tailwind CSS**, **Vite**, **Express**, and **Vitest**.

Connected to an **ESP32** and **STM32F103C8T6 Blue Pill** with an **HC-SR04 ultrasonic distance sensor** mounted in the bottle cap.

---

## 1. System Architecture & Hardware Data Flow

```
┌─────────────────────────────────┐
│     HC-SR04 Sensor in Cap       │
│  (Trigger: PA1, Echo: PA2)      │
└────────────────┬────────────────┘
                 │ Microsecond Echo Pulses (3.3V Divider)
                 ▼
┌─────────────────────────────────┐
│   STM32F103C8T6 "Blue Pill"     │
│  • Measures acoustic transit    │
│  • Computes depth & percentage  │
│  • Formats JSON telemetry       │
└────────────────┬────────────────┘
                 │ UART1 (115200 8N1: PA9 TX -> GPIO16 RX)
                 ▼
┌─────────────────────────────────┐
│          ESP32 Gateway          │
│  • Wi-Fi SoftAP: 192.168.4.1    │
│  • SSID: "WaterBottle-Monitor"  │
│  • HTTP REST API (/api/level)   │
│  • Embeds self-contained UI     │
└────────┬────────────────────────┘
         │ HTTP GET /api/level (CORS Enabled)
         ▼
┌─────────────────────────────────────────────────────────┐
│       Neubrutalism Web Dashboard (This Project)         │
│  • Animated transparent water bottle with liquid wave   │
│  • Live percentage, water depth (cm), and headspace (cm)│
│  • Dynamic status tags (EMPTY, LOW, MID, HIGH, FULL)    │
│  • Interactive calibration (17cm default usable height) │
│  • In-memory session trend chart (SVG sparkline)        │
│  • Diagnostic telemetry inspector & CORS/Wi-Fi guide    │
│  • Isolated development simulator mode                  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Neubrutalism Visual Design System

The user interface follows an unapologetic, intentional Neubrutalist aesthetic:
- **Thick Black Borders:** `3px` and `4px` solid `#000000` on all cards, buttons, badges, and illustrations.
- **Hard Offset Drop Shadows:** Sharp, unblurred shadows (`4px 4px 0 #000`, `6px 6px 0 #000`, `8px 8px 0 #000`).
- **High-Voltage Palette:**
  - Vivid Yellow (`#FFE600`) — Primary accent and fill status
  - Electric Cyan (`#00E5FF`) — Liquid visualization and depth
  - Lime Green (`#00FF66`) — Online status and container volume
  - Hot Pink (`#FF3399`) — Headspace and critical warnings
  - Canvas Off-White (`#F4EFE6`) — Warm background contrast
  - Solid Jet Black (`#000000`) — Structural outlines and typography
- **Tactile Button Press States:** Buttons depress on click (`transform: translate(2px, 2px); box-shadow: 1px 1px 0 #000;`).
- **Accessibility & Reduced Motion:** Full `prefers-reduced-motion` suppression and high-contrast typography.

---

## 3. Project Directory Structure

```
d:\alfi server/
├── package.json                 # Monorepo root scripts (dev, build, test, mock)
├── README.md                    # System architecture, deployment & wiring guide
├── backend/                     # Node.js Express server & ESP32 proxy
│   ├── package.json
│   ├── src/
│   │   ├── server.js            # Express server (CORS proxy & static SPA host)
│   │   └── mock-esp32.js        # Realistic standalone ESP32 hardware simulator
│   └── tests/
│       └── server.test.js       # Backend integration test suite
└── frontend/                    # React 19 + TypeScript + Vite + Tailwind CSS
    ├── package.json
    ├── vite.config.ts           # Vite bundler configuration & local API proxy
    ├── tailwind.config.js       # Neubrutalism color and shadow tokens
    ├── index.html
    └── src/
        ├── App.tsx              # Main dashboard view
        ├── types/telemetry.ts   # TypeScript interfaces for sensor readings
        ├── utils/
        │   └── telemetryValidator.ts # Robust parser, bounds checker & math logic
        ├── hooks/
        │   └── useWaterTelemetry.ts  # Sequential polling, stale detection & simulator
        ├── components/
        │   ├── Header.tsx            # Live badge, device name, fast controls
        │   ├── BottleVisualization.tsx # Animated SVG bottle with wave & markings
        │   ├── StatCards.tsx         # Fill %, depth, headspace, configurable volume
        │   ├── CalibrationPanel.tsx  # 17cm adjustable height, blind spot offset
        │   ├── HistorySection.tsx    # SVG trend sparkline & volatile session log
        │   ├── DiagnosticsPanel.tsx  # API URL presets, latency, Wi-Fi guide
        │   └── SimulatorControls.tsx # Isolated dev tool with 0%, 25%, 50%, 75%, 100%
        └── test/
            ├── setup.ts
            └── telemetryValidator.test.ts # 10 comprehensive unit tests
```

---

## 4. Quick Start & Commands

### Prerequisites
- Node.js v18.0.0 or later (tested on Node v25.6.0)
- npm v9.0.0 or later

### Install Dependencies
```bash
# From d:\alfi server root:
npm run install:all
```

### Run Available Tests
```bash
# Runs both backend and frontend unit tests:
npm run test
```

### Start Development Server
```bash
# Starts both frontend (port 5173) and backend proxy (port 3000):
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Start Standalone Mock ESP32 Hardware Simulator
If hardware is not plugged in, start the local mock ESP32 server:
```bash
npm run mock:esp32
```
This runs a simulated ESP32 SoftAP API on **`http://localhost:3001/api/level`** with realistic ultrasonic fluctuations and CORS enabled.

### Build for Production
```bash
npm run build
```
Builds static assets to `frontend/dist/` ready for static deployment or serving via Node/Nginx.

---

## 5. Live Sensor Connection & Networking Constraints

### Default Hardware API Details
- **Wi-Fi SSID:** `WaterBottle-Monitor` (or `SmartWaterBottle`)
- **Wi-Fi Password:** `water1234`
- **Default IP:** `192.168.4.1`
- **Endpoints:**
  - `http://192.168.4.1/api/level`
  - `http://192.168.4.1/api/status`

### Expected JSON Telemetry Payload
```json
{
  "device": "WaterBottleMonitor",
  "online": true,
  "status": "LIVE",
  "distanceCm": 5.2,
  "waterLevelCm": 11.8,
  "fillPercent": 69.4,
  "ageMs": 150,
  "distance_cm": 5.2,
  "water_level_cm": 11.8,
  "level_percent": 69,
  "valid": true,
  "stale": false
}
```

### Critical Networking Considerations

1. **Local SoftAP Boundary:**
   The ESP32 runs a local Wi-Fi access point on `192.168.4.1`. A remote cloud website (e.g. hosted on Vercel or AWS) **cannot** route to private IP `192.168.4.1` unless the user's laptop or mobile device is connected directly to the ESP32 Wi-Fi network.

2. **Mixed Content Security (HTTPS vs HTTP):**
   Modern browsers block insecure `http://` API calls when the webpage itself is loaded over `https://`. If you host the dashboard on an HTTPS domain, browser security blocks calls to `http://192.168.4.1/api/level`.
   - **Recommended Solutions:**
     - Option A: Run the dashboard locally over HTTP (`http://localhost:5173` or `http://localhost:3000`).
     - Option B: Serve the dashboard directly from the ESP32 at `http://192.168.4.1/`.
     - Option C: Use the local backend proxy (`/api/level`).

3. **CORS (Cross-Origin Resource Sharing):**
   The ESP32 firmware in `D:\alfi\RFID_Access_Control\ESP32_Dashboard\ESP32_Dashboard.ino` includes:
   ```cpp
   server.sendHeader("Access-Control-Allow-Origin", "*");
   server.sendHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
   server.sendHeader("Access-Control-Allow-Headers", "*");
   ```
   This allows cross-origin requests from any browser client.

---

## 6. How to Connect Laptop to Hardware and Verify Live Telemetry

1. **Power the Hardware:**
   Connect the STM32 Blue Pill and ESP32 to a 5V power supply or power bank.
2. **Connect to Wi-Fi Access Point:**
   On your laptop, search for Wi-Fi networks and connect to:
   - **SSID:** `WaterBottle-Monitor`
   - **Password:** `water1234`
3. **Verify IP Connectivity:**
   Open a terminal and ping `192.168.4.1`:
   ```bash
   ping 192.168.4.1
   ```
4. **Open the Dashboard:**
   - **Method 1 (Local Web App):** Open `http://localhost:5173` in your browser. Ensure the target URL in Diagnostics is set to `http://192.168.4.1/api/level`.
   - **Method 2 (Direct from ESP32):** Open `http://192.168.4.1/` in your browser. The ESP32 serves the self-contained Neubrutalism UI directly from internal flash memory.
5. **Physical Bottle Test:**
   - Empty bottle: Distance measures ~17.0 cm → Dashboard shows **0.0% / EMPTY**.
   - Half fill bottle: Distance measures ~9.5 cm → Dashboard shows **~50.0% / MID**.
   - Full bottle: Distance measures ~2.0 cm → Dashboard shows **~100.0% / FULL**.

---

## 7. Development Simulator Verification (Deliverable 6)

When hardware is not present, activate **SIMULATOR MODE** in the top header or dev banner.
The simulator lets you test representative calibration states:
- **0% (Empty):** Sets distance to `17.0 cm`. Bottle drains to bottom, status shows `EMPTY`.
- **25% (Low):** Sets distance to `13.3 cm`. Bottle displays 25% fill, status shows `LOW`.
- **50% (Mid):** Sets distance to `9.5 cm`. Bottle displays 50% fill, status shows `MID`.
- **75% (High):** Sets distance to `5.8 cm`. Bottle displays 75% fill, status shows `HIGH`.
- **100% (Full):** Sets distance to `2.0 cm`. Bottle fills to top mark, status shows `FULL`.
- **Wave Cycle Test:** Dynamically sweeps liquid height up and down in a continuous sine wave to verify smooth CSS/SVG transitions without resetting.
- **Sensor Blind Spot Error:** Sets distance to `0.4 cm` (< 1.0 cm minimum acoustic limit). The bottle renders error stripes and tags the reading as `Sensor Blind Spot Error`.
- **Cap Off Error:** Sets distance to `38.0 cm` (beyond bottle boundary). The UI tags the reading as `Echo Lost`.
