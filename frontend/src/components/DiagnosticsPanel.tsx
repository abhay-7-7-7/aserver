import React, { useState } from 'react';
import { ConnectionStatus, NetworkDiagnostics } from '../types/telemetry';
import { AlertTriangle, ChevronDown, ChevronUp, Network, Wifi } from 'lucide-react';

interface DiagnosticsPanelProps {
  diagnostics: NetworkDiagnostics;
  connectionStatus: ConnectionStatus;
  apiUrl: string;
  onUpdateApiUrl: (url: string) => void;
  pollingIntervalMs: number;
  onUpdatePollingInterval: (ms: number) => void;
  ageMs: number;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  connectionStatus,
  apiUrl,
  onUpdateApiUrl,
  pollingIntervalMs,
  onUpdatePollingInterval,
  ageMs,
}) => {
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onUpdateApiUrl(urlInput.trim());
    }
  };

  const handlePresetSelect = (preset: string) => {
    setUrlInput(preset);
    onUpdateApiUrl(preset);
  };

  return (
    <div className="brutal-card bg-brutal-white p-5 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-3 border-black gap-2">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-brutal-blue" />
          <h3 className="font-display font-black text-lg md:text-xl uppercase tracking-tight">
            I/O & NETWORK DIAGNOSTICS
          </h3>
        </div>

        <button
          onClick={() => setShowTroubleshooting(!showTroubleshooting)}
          className="brutal-btn bg-brutal-yellow px-3 py-1 text-xs flex items-center gap-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {showTroubleshooting ? 'HIDE TROUBLESHOOTING GUIDE' : 'WIFI / CORS SETUP GUIDE'}
          {showTroubleshooting ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Target URL & Polling Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8 flex flex-col gap-3">
          <form onSubmit={handleUrlSubmit} className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-black uppercase text-black">
              ESP32 HTTP ENDPOINT (REST URL):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="http://192.168.4.1/api/level"
                className="brutal-input flex-1 text-xs font-mono font-bold"
              />
              <button
                type="submit"
                className="brutal-btn bg-brutal-yellow px-4 py-2 text-xs font-bold"
              >
                APPLY URL
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
            <span className="font-bold text-gray-500">PRESETS:</span>
            <button
              onClick={() => handlePresetSelect('http://192.168.4.1/api/level')}
              className="px-2 py-0.5 border border-black bg-white hover:bg-yellow-200 shadow-brutal-sm"
            >
              http://192.168.4.1/api/level
            </button>
            <button
              onClick={() => handlePresetSelect('http://192.168.4.1/api/status')}
              className="px-2 py-0.5 border border-black bg-white hover:bg-yellow-200 shadow-brutal-sm"
            >
              http://192.168.4.1/api/status
            </button>
            <button
              onClick={() => handlePresetSelect('/api/level')}
              className="px-2 py-0.5 border border-black bg-white hover:bg-yellow-200 shadow-brutal-sm"
            >
              /api/level (Proxy)
            </button>
            <button
              onClick={() => handlePresetSelect('http://localhost:3001/api/level')}
              className="px-2 py-0.5 border border-black bg-white hover:bg-yellow-200 shadow-brutal-sm"
            >
              http://localhost:3001/api/level
            </button>
          </div>
        </div>

        {/* Polling Interval Slider */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-brutal-canvas border-2 border-black p-3 shadow-brutal-sm">
          <div className="flex justify-between items-center font-mono text-xs font-bold">
            <span>POLLING INTERVAL:</span>
            <span className="bg-white border border-black px-1.5 py-0.5">{pollingIntervalMs} ms</span>
          </div>
          <input
            type="range"
            min="300"
            max="3000"
            step="100"
            value={pollingIntervalMs}
            onChange={(e) => onUpdatePollingInterval(parseInt(e.target.value, 10))}
            className="accent-black cursor-pointer h-2 bg-gray-200 border border-black my-2"
          />
          <div className="flex justify-between text-[10px] font-mono text-gray-500">
            <span>300ms (Fast)</span>
            <span>800ms (Default)</span>
            <span>3000ms (Battery)</span>
          </div>
        </div>
      </div>

      {/* Network Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs mb-4">
        <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
          <span className="text-gray-500 block text-[10px] font-bold">CONNECTION STATE</span>
          <span className={`font-black uppercase ${
            connectionStatus === 'CONNECTED' ? 'text-green-600' : 'text-red-600'
          }`}>
            {connectionStatus}
          </span>
        </div>

        <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
          <span className="text-gray-500 block text-[10px] font-bold">PACKET AGE / LATENCY</span>
          <span className="font-black text-black">
            {diagnostics.lastLatencyMs !== null ? `${diagnostics.lastLatencyMs} ms RTT` : '--'}
            {ageMs ? ` (${Math.round(ageMs)}ms age)` : ''}
          </span>
        </div>

        <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
          <span className="text-gray-500 block text-[10px] font-bold">CONSECUTIVE ERRORS</span>
          <span className={`font-black ${diagnostics.consecutiveErrors > 0 ? 'text-red-600' : 'text-black'}`}>
            {diagnostics.consecutiveErrors} FAILURES
          </span>
        </div>

        <div className="bg-white border-2 border-black p-2.5 shadow-brutal-sm">
          <span className="text-gray-500 block text-[10px] font-bold">PACKETS RECEIVED</span>
          <span className="font-black text-black">
            {diagnostics.totalPacketsReceived} TOTAL
          </span>
        </div>
      </div>

      {/* Interactive Wi-Fi SoftAP & Networking Limitations Guide */}
      {showTroubleshooting && (
        <div className="bg-brutal-yellow border-3 border-black p-5 shadow-brutal text-xs font-mono space-y-4">
          <div className="flex items-center gap-2 font-black text-sm uppercase">
            <Wifi className="w-5 h-5 text-black" />
            CRITICAL NETWORKING REQUIREMENTS & LIMITATIONS
          </div>

          <div className="space-y-3 text-black leading-relaxed">
            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
              <span className="font-black block uppercase text-brutal-blue mb-1">
                1. LOCAL WI-FI ACCESS POINT (SoftAP)
              </span>
              <p>
                The ESP32 broadcasts a standalone Wi-Fi Access Point:
                <br />
                • <strong>SSID:</strong> <code className="bg-gray-100 px-1 py-0.5 border border-black">WaterBottle-Monitor</code> (or <code className="bg-gray-100 px-1 py-0.5 border border-black">SmartWaterBottle</code>)
                <br />
                • <strong>Password:</strong> <code className="bg-gray-100 px-1 py-0.5 border border-black">water1234</code>
                <br />
                • <strong>Default Gateway IP:</strong> <code className="bg-gray-100 px-1 py-0.5 border border-black">192.168.4.1</code>
                <br />
                Your laptop/phone <strong>must be connected to this Wi-Fi network</strong> to reach <code className="font-bold">192.168.4.1</code> directly from the browser. A website hosted on the public internet (e.g. Vercel) cannot route to private subnet <code className="font-bold">192.168.4.1</code> unless the user device is on the same local network!
              </p>
            </div>

            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
              <span className="font-black block uppercase text-brutal-pink mb-1">
                2. BROWSER MIXED CONTENT RESTRICTIONS (HTTPS vs HTTP)
              </span>
              <p>
                Modern browsers strictly block HTTP requests from an HTTPS origin (Mixed Content Block). If this site is loaded over <strong>https://</strong>, calling <code className="font-bold">http://192.168.4.1/api/level</code> will be blocked by Chrome/Safari security.
                <br />
                <strong>Solutions:</strong>
                <br />
                A. Serve the site locally over HTTP (e.g. <code className="font-bold">http://localhost:5173</code> via Vite).
                <br />
                B. Serve the website directly from the ESP32 itself at <code className="font-bold">http://192.168.4.1/</code>!
                <br />
                C. Use the local proxy server (<code className="font-bold">npm run dev</code> or <code className="font-bold">/api/level</code>).
              </p>
            </div>

            <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
              <span className="font-black block uppercase text-brutal-greenDark mb-1">
                3. CORS HEADERS ON ESP32
              </span>
              <p>
                The ESP32 firmware includes <code className="font-bold">Access-Control-Allow-Origin: *</code> and supports HTTP OPTIONS preflight headers so any origin can fetch sensor JSON without cross-origin blocks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
