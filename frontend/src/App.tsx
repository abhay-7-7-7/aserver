import React from 'react';
import { useWaterTelemetry } from './hooks/useWaterTelemetry';
import { Header } from './components/Header';
import { SimulatorControls } from './components/SimulatorControls';
import { BottleVisualization } from './components/BottleVisualization';
import { StatCards } from './components/StatCards';
import { CalibrationPanel } from './components/CalibrationPanel';
import { HistorySection } from './components/HistorySection';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';

export const App: React.FC = () => {
  const {
    reading,
    connectionStatus,
    isPaused,
    togglePause,
    calibration,
    setCalibration,
    history,
    clearHistory,
    diagnostics,
    apiUrl,
    setApiUrl,
    pollingIntervalMs,
    setPollingIntervalMs,
    isSimulatorMode,
    toggleSimulatorMode,
    simulatorDistance,
    setSimulatorDistance,
    simulatorCycleActive,
    setSimulatorPreset,
    refreshNow,
  } = useWaterTelemetry();

  const isValid = Boolean(
    reading?.isValid && (connectionStatus === 'CONNECTED' || isSimulatorMode)
  );

  return (
    <div className="min-h-screen bg-brutal-canvas text-black p-4 md:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <Header
          connectionStatus={connectionStatus}
          device={reading?.device || 'WaterBottleMonitor'}
          lastReadingTime={reading?.receivedAt || null}
          ageMs={reading?.ageMs || 0}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onRefresh={refreshNow}
          isSimulatorMode={isSimulatorMode}
          onToggleSimulator={toggleSimulatorMode}
        />

        {/* Development Simulator Controls & Hazard Banner */}
        <SimulatorControls
          isSimulatorMode={isSimulatorMode}
          onToggleSimulator={toggleSimulatorMode}
          simulatorDistance={simulatorDistance}
          onDistanceChange={setSimulatorDistance}
          onPresetSelect={setSimulatorPreset}
          cycleActive={simulatorCycleActive}
          calibration={calibration}
        />

        {/* Hero Section: Animated Reusable Bottle + Giant Telemetry Display */}
        <div className="mb-6">
          <BottleVisualization
            reading={reading}
            connectionStatus={connectionStatus}
            calibration={calibration}
            isSimulatorMode={isSimulatorMode}
          />
        </div>

        {/* 4 Large Rectangular Neubrutalist Stat Cards */}
        <StatCards
          reading={reading}
          calibration={calibration}
          onUpdateCalibration={setCalibration}
          isValid={isValid}
        />

        {/* Calibration & Geometry Tuning Panel */}
        <CalibrationPanel
          calibration={calibration}
          onChangeCalibration={setCalibration}
        />

        {/* Volatile In-Memory Session History & Trend Chart */}
        <HistorySection
          history={history}
          onClearHistory={clearHistory}
        />

        {/* I/O & Network Diagnostics + Troubleshooting */}
        <DiagnosticsPanel
          diagnostics={diagnostics}
          connectionStatus={connectionStatus}
          apiUrl={apiUrl}
          onUpdateApiUrl={setApiUrl}
          pollingIntervalMs={pollingIntervalMs}
          onUpdatePollingInterval={setPollingIntervalMs}
          ageMs={reading?.ageMs || 0}
        />

        {/* Footer */}
        <footer className="mt-8 pt-6 pb-12 border-t-3 border-black text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-brutal-yellow border-2 border-black" />
            <span className="font-extrabold uppercase">
              WATER//LEVEL v1.0.0 · NEUBRUTALISM IOT SUITE
            </span>
          </div>
          <div className="text-right">
            <span>STM32F103C8T6 (PA1/PA2 HC-SR04) → ESP32 (GPIO16/17 UART2) → HTTP JSON API</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
