export type ConnectionStatus =
  | 'CONNECTING'
  | 'CONNECTED'
  | 'STALE'
  | 'DISCONNECTED'
  | 'ERROR';

export type LiquidStatus = 'EMPTY' | 'LOW' | 'MID' | 'HIGH' | 'FULL' | 'INVALID';

export interface WaterLevelReading {
  device: string;
  online: boolean;
  status: string;
  distanceCm: number;
  waterLevelCm: number;
  fillPercent: number;
  ageMs: number;
  receivedAt: Date;
  isValid: boolean;
  isStale: boolean;
  errorMessage?: string;
  rawPayload?: Record<string, unknown>;
}

export interface BottleCalibration {
  usableHeightCm: number;       // Physical height of bottle (default 17.0 cm)
  sensorBlindSpotCm: number;    // Min sensor reading when full (default 2.0 cm)
  bottleCapacityMl: number | null; // Optional bottle volume (e.g. 750 mL)
  mode: 'FIRMWARE_AUTHORITATIVE' | 'CUSTOM_CALIBRATION';
}

export interface TelemetryHistoryItem {
  id: string;
  timestamp: string;
  timeLabel: string;
  distanceCm: number;
  waterLevelCm: number;
  fillPercent: number;
  status: string;
  isValid: boolean;
}

export interface NetworkDiagnostics {
  apiUrl: string;
  pollingIntervalMs: number;
  consecutiveErrors: number;
  lastHttpCode: number | null;
  lastLatencyMs: number | null;
  totalPacketsReceived: number;
}
