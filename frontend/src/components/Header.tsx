import React from 'react';
import { ConnectionStatus } from '../types/telemetry';
import { Activity, AlertTriangle, CheckCircle2, Pause, Play, RefreshCw, WifiOff, Wrench } from 'lucide-react';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  device: string;
  lastReadingTime: Date | null;
  ageMs: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onRefresh: () => void;
  isSimulatorMode: boolean;
  onToggleSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  device,
  lastReadingTime,
  ageMs,
  isPaused,
  onTogglePause,
  onRefresh,
  isSimulatorMode,
  onToggleSimulator,
}) => {
  const getStatusBadge = () => {
    if (isSimulatorMode) {
      return (
        <span className="brutal-badge bg-brutal-cyan text-black border-2 border-black">
          <Wrench className="w-3.5 h-3.5 animate-spin" />
          SIMULATOR
        </span>
      );
    }

    switch (connectionStatus) {
      case 'CONNECTED':
        return (
          <span className="brutal-badge bg-brutal-green text-black border-2 border-black">
            <CheckCircle2 className="w-3.5 h-3.5" />
            LIVE // ONLINE
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="brutal-badge bg-brutal-yellow text-black border-2 border-black animate-pulse">
            <Activity className="w-3.5 h-3.5" />
            CONNECTING...
          </span>
        );
      case 'STALE':
        return (
          <span className="brutal-badge bg-brutal-orange text-white border-2 border-black">
            <AlertTriangle className="w-3.5 h-3.5" />
            STALE TELEMETRY
          </span>
        );
      case 'DISCONNECTED':
      case 'ERROR':
      default:
        return (
          <span className="brutal-badge bg-brutal-pink text-white border-2 border-black">
            <WifiOff className="w-3.5 h-3.5" />
            DISCONNECTED
          </span>
        );
    }
  };

  const formatAge = (ms: number) => {
    if (!lastReadingTime) return 'NO DATA';
    if (ms < 1000) return 'JUST NOW';
    if (ms < 60000) return `${Math.floor(ms / 1000)}s AGO`;
    return `${Math.floor(ms / 60000)}m AGO`;
  };

  return (
    <header className="brutal-card bg-brutal-white p-4 md:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Project Identity */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brutal-yellow border-3 border-black shadow-brutal flex items-center justify-center font-display font-black text-2xl rotate-[-2deg]">
            W
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase">
                WATER<span className="text-brutal-blue">//</span>LEVEL
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-xs font-mono font-bold text-brutal-muted uppercase mt-0.5">
              ESP32 + STM32 BLUE PILL · HC-SR04 ULTRASONIC TELEMETRY
            </p>
          </div>
        </div>

        {/* Device metadata & quick status */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="bg-brutal-canvas border-2 border-black px-3 py-1 shadow-brutal-sm text-xs font-mono">
            <span className="font-bold text-gray-600">DEVICE:</span>{' '}
            <span className="font-extrabold uppercase">{device}</span>
          </div>

          <div className="bg-brutal-canvas border-2 border-black px-3 py-1 shadow-brutal-sm text-xs font-mono">
            <span className="font-bold text-gray-600">UPDATED:</span>{' '}
            <span className="font-extrabold">{formatAge(ageMs)}</span>
          </div>

          {/* Action buttons */}
          <button
            onClick={onTogglePause}
            className={`brutal-btn px-3 py-1 text-xs flex items-center gap-1.5 ${
              isPaused ? 'bg-brutal-orange text-white' : 'bg-brutal-yellow'
            }`}
            title={isPaused ? 'Resume polling' : 'Pause live polling'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>

          <button
            onClick={onRefresh}
            disabled={isPaused || isSimulatorMode}
            className="brutal-btn bg-white hover:bg-gray-100 px-3 py-1 text-xs flex items-center gap-1.5"
            title="Poll immediate reading"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            POLL
          </button>

          <button
            onClick={onToggleSimulator}
            className={`brutal-btn px-3 py-1 text-xs flex items-center gap-1.5 ${
              isSimulatorMode
                ? 'bg-brutal-pink text-white shadow-brutal-md'
                : 'bg-brutal-cyan text-black hover:bg-cyan-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            {isSimulatorMode ? 'EXIT SIMULATOR' : 'SIMULATOR'}
          </button>
        </div>
      </div>
    </header>
  );
};
