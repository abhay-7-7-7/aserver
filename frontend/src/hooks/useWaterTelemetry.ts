import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BottleCalibration,
  ConnectionStatus,
  NetworkDiagnostics,
  TelemetryHistoryItem,
  WaterLevelReading,
} from '../types/telemetry';
import {
  DEFAULT_CALIBRATION,
  validateAndParseReading,
} from '../utils/telemetryValidator';

export interface UseWaterTelemetryOptions {
  initialApiUrl?: string;
  initialPollingIntervalMs?: number;
}

export function useWaterTelemetry({
  initialApiUrl = 'http://192.168.4.1/api/level',
  initialPollingIntervalMs = 800,
}: UseWaterTelemetryOptions = {}) {
  // Calibration settings
  const [calibration, setCalibration] = useState<BottleCalibration>(DEFAULT_CALIBRATION);

  // Network configuration
  const [apiUrl, setApiUrl] = useState<string>(initialApiUrl);
  const [pollingIntervalMs, setPollingIntervalMs] = useState<number>(initialPollingIntervalMs);

  // Connection & Stream State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('CONNECTING');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [reading, setReading] = useState<WaterLevelReading | null>(null);

  // Volatile In-Memory History (max 50 points)
  const [history, setHistory] = useState<TelemetryHistoryItem[]>([]);

  // Diagnostics
  const [diagnostics, setDiagnostics] = useState<NetworkDiagnostics>({
    apiUrl: initialApiUrl,
    pollingIntervalMs: initialPollingIntervalMs,
    consecutiveErrors: 0,
    lastHttpCode: null,
    lastLatencyMs: null,
    totalPacketsReceived: 0,
  });

  // Simulator Mode (Strictly isolated development feature)
  const [isSimulatorMode, setIsSimulatorMode] = useState<boolean>(false);
  const [simulatorDistance, setSimulatorDistance] = useState<number>(5.2);
  const [simulatorCycleActive, setSimulatorCycleActive] = useState<boolean>(false);

  // Refs for tracking async state & preventing overlapping requests
  const inFlightRef = useRef<boolean>(false);
  const consecutiveErrorsRef = useRef<number>(0);
  const lastPacketTimeRef = useRef<number>(0);
  const cycleDirectionRef = useRef<number>(0.2); // for cycle wave animation

  // Add reading to history
  const appendHistory = useCallback((r: WaterLevelReading) => {
    const item: TelemetryHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: r.receivedAt.toISOString(),
      timeLabel: r.receivedAt.toLocaleTimeString(),
      distanceCm: r.distanceCm,
      waterLevelCm: r.waterLevelCm,
      fillPercent: r.fillPercent,
      status: r.status,
      isValid: r.isValid,
    };

    setHistory((prev) => [item, ...prev.slice(0, 49)]);
  }, []);

  // Poll function with sequential request guard & AbortController
  const pollDevice = useCallback(async () => {
    if (inFlightRef.current || isPaused || isSimulatorMode) {
      return;
    }

    inFlightRef.current = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const startTime = performance.now();

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const validation = validateAndParseReading(json, calibration);

      if (validation.success && validation.data) {
        const data = validation.data;
        consecutiveErrorsRef.current = 0;
        lastPacketTimeRef.current = Date.now();

        setReading(data);
        appendHistory(data);

        setConnectionStatus(data.isStale ? 'STALE' : 'CONNECTED');

        setDiagnostics((prev) => ({
          ...prev,
          consecutiveErrors: 0,
          lastHttpCode: response.status,
          lastLatencyMs: latency,
          totalPacketsReceived: prev.totalPacketsReceived + 1,
        }));
      } else {
        throw new Error(validation.error || 'Invalid sensor telemetry payload');
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const latency = Math.round(performance.now() - startTime);
      consecutiveErrorsRef.current += 1;

      const isTimeout = err instanceof Error && err.name === 'AbortError';
      const statusText = isTimeout ? 'Request Timeout' : (err instanceof Error ? err.message : 'Network Error');

      setDiagnostics((prev) => ({
        ...prev,
        consecutiveErrors: consecutiveErrorsRef.current,
        lastHttpCode: isTimeout ? 408 : 0,
        lastLatencyMs: latency,
      }));

      if (consecutiveErrorsRef.current >= 3) {
        setConnectionStatus('DISCONNECTED');
        setReading((prev) => prev ? { ...prev, isStale: true, status: statusText } : null);
      } else {
        setConnectionStatus('CONNECTING');
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [apiUrl, calibration, isPaused, isSimulatorMode, appendHistory]);

  // Main polling interval loop
  useEffect(() => {
    if (isSimulatorMode) return;

    // Initial immediate poll
    pollDevice();

    const interval = setInterval(() => {
      // Check staleness timeout even between polls
      if (lastPacketTimeRef.current > 0 && Date.now() - lastPacketTimeRef.current > 5000) {
        setConnectionStatus((prev) => prev === 'CONNECTED' ? 'STALE' : prev);
      }
      pollDevice();
    }, pollingIntervalMs);

    return () => clearInterval(interval);
  }, [pollDevice, pollingIntervalMs, isSimulatorMode]);

  // Simulator loop & update handler
  useEffect(() => {
    if (!isSimulatorMode) return;

    setConnectionStatus('CONNECTED');

    const updateSimulator = (distance: number, overrideOnline: boolean = true) => {
      const mockRaw = {
        device: 'WaterBottleMonitor [SIMULATOR]',
        online: overrideOnline,
        status: overrideOnline ? 'LIVE' : 'ERROR',
        distanceCm: distance,
        ageMs: 10,
      };

      const result = validateAndParseReading(mockRaw, calibration);
      if (result.success && result.data) {
        setReading(result.data);
        appendHistory(result.data);
      }
    };

    if (simulatorCycleActive) {
      const cycleInterval = setInterval(() => {
        setSimulatorDistance((curr) => {
          let next = curr + cycleDirectionRef.current;
          if (next >= calibration.usableHeightCm) {
            next = calibration.usableHeightCm;
            cycleDirectionRef.current = -0.3; // drain to full
          } else if (next <= calibration.sensorBlindSpotCm) {
            next = calibration.sensorBlindSpotCm;
            cycleDirectionRef.current = 0.3; // fill to empty
          }
          updateSimulator(next);
          return Math.round(next * 10) / 10;
        });
      }, 150);

      return () => clearInterval(cycleInterval);
    } else {
      updateSimulator(simulatorDistance);
    }
  }, [isSimulatorMode, simulatorDistance, simulatorCycleActive, calibration, appendHistory]);

  // Preset setter for simulator mode
  const setSimulatorPreset = useCallback((preset: '0' | '25' | '50' | '75' | '100' | 'cycle' | 'error_blind' | 'error_echo') => {
    setSimulatorCycleActive(false);

    const span = calibration.usableHeightCm - calibration.sensorBlindSpotCm;

    switch (preset) {
      case '0':
        // Empty = sensor sees bottom = usableHeightCm
        setSimulatorDistance(calibration.usableHeightCm);
        break;
      case '25':
        // 25% full = 75% distance
        setSimulatorDistance(Math.round((calibration.sensorBlindSpotCm + span * 0.75) * 10) / 10);
        break;
      case '50':
        // 50% full = 50% distance
        setSimulatorDistance(Math.round((calibration.sensorBlindSpotCm + span * 0.5) * 10) / 10);
        break;
      case '75':
        // 75% full = 25% distance
        setSimulatorDistance(Math.round((calibration.sensorBlindSpotCm + span * 0.25) * 10) / 10);
        break;
      case '100':
        // 100% full = full to blind spot offset
        setSimulatorDistance(calibration.sensorBlindSpotCm);
        break;
      case 'cycle':
        setSimulatorCycleActive(true);
        break;
      case 'error_blind':
        setSimulatorDistance(0.4); // under 1cm
        break;
      case 'error_echo':
        setSimulatorDistance(38.0); // lost reflection
        break;
    }
  }, [calibration]);

  const toggleSimulatorMode = useCallback((enabled?: boolean) => {
    setIsSimulatorMode((prev) => {
      const next = typeof enabled === 'boolean' ? enabled : !prev;
      if (next) {
        setConnectionStatus('CONNECTED');
        setSimulatorPreset('50');
      } else {
        setSimulatorCycleActive(false);
        setConnectionStatus('CONNECTING');
      }
      return next;
    });
  }, [setSimulatorPreset]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
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
    refreshNow: pollDevice,
  };
}
