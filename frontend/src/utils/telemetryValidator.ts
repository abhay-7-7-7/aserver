import { BottleCalibration, LiquidStatus, WaterLevelReading } from '../types/telemetry';

export const DEFAULT_CALIBRATION: BottleCalibration = {
  usableHeightCm: 17.0,
  sensorBlindSpotCm: 2.0,
  bottleCapacityMl: 750,
  mode: 'FIRMWARE_AUTHORITATIVE',
};

/**
 * Validates and normalizes incoming telemetry from ESP32 / STM32.
 * Supports both camelCase and snake_case payloads.
 */
export function validateAndParseReading(
  raw: unknown,
  calibration: BottleCalibration = DEFAULT_CALIBRATION
): { success: boolean; data?: WaterLevelReading; error?: string } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, error: 'Payload is not a valid JSON object' };
  }

  const obj = raw as Record<string, unknown>;

  // Extract raw fields with fallbacks for both naming conventions
  const distanceRaw = obj.distanceCm ?? obj.distance_cm;
  const levelPercentRaw = obj.fillPercent ?? obj.level_percent;
  const waterLevelRaw = obj.waterLevelCm ?? obj.water_level_cm;
  const ageMsRaw = obj.ageMs ?? obj.age_ms;
  const onlineRaw = obj.online ?? obj.valid ?? true;
  const statusRaw = obj.status ?? (obj.valid === false ? 'Sensor Error' : 'LIVE');
  const deviceRaw = obj.device ?? 'WaterBottleMonitor';

  // Parse distance
  const distanceCm = typeof distanceRaw === 'number'
    ? distanceRaw
    : typeof distanceRaw === 'string'
      ? parseFloat(distanceRaw)
      : NaN;

  if (Number.isNaN(distanceCm) || !Number.isFinite(distanceCm)) {
    return { success: false, error: 'Missing or non-numeric sensor distance' };
  }

  if (distanceCm < 0) {
    return { success: false, error: 'Negative sensor distance is physically impossible' };
  }

  if (distanceCm > 400.0) {
    return { success: false, error: 'Distance exceeds ultrasonic sensor maximum limit (400cm)' };
  }

  // Check physical sensor anomalies
  const isBlindSpot = distanceCm < 1.0; // HC-SR04 physical blind spot
  const isCapOff = distanceCm > (calibration.usableHeightCm * 1.8); // Echo lost or cap removed

  let waterLevelCm = 0;
  let fillPercent = 0;
  let isValid = Boolean(onlineRaw);

  if (isBlindSpot || isCapOff || onlineRaw === false) {
    isValid = false;
  }

  if (calibration.mode === 'CUSTOM_CALIBRATION' || typeof levelPercentRaw !== 'number') {
    // Client-side physics calculation based on configured bottle height & sensor offset
    // As water rises, distance from cap DECREASES.
    // Water height = Usable height - measured distance
    const depth = calibration.usableHeightCm - distanceCm;
    waterLevelCm = Math.max(0, Math.min(calibration.usableHeightCm, depth));

    const effectiveSpan = Math.max(0.1, calibration.usableHeightCm - calibration.sensorBlindSpotCm);
    const calculatedPercent = (waterLevelCm / effectiveSpan) * 100;
    fillPercent = Math.max(0, Math.min(100, calculatedPercent));
  } else {
    // Firmware authoritative calculation
    fillPercent = Math.max(0, Math.min(100, Number(levelPercentRaw)));
    if (typeof waterLevelRaw === 'number' && Number.isFinite(waterLevelRaw)) {
      waterLevelCm = Math.max(0, Math.min(calibration.usableHeightCm, waterLevelRaw));
    } else {
      // Approximate from fillPercent and usable height
      waterLevelCm = (fillPercent / 100) * (calibration.usableHeightCm - calibration.sensorBlindSpotCm);
    }
  }

  // Age calculation
  const ageMs = typeof ageMsRaw === 'number' && Number.isFinite(ageMsRaw) && ageMsRaw >= 0 ? ageMsRaw : 0;
  const isStale = Boolean(obj.stale) || ageMs > 5000;

  const reading: WaterLevelReading = {
    device: String(deviceRaw || 'WaterBottleMonitor'),
    online: Boolean(onlineRaw),
    status: String(statusRaw || (isValid ? 'LIVE' : 'ERROR')),
    distanceCm: Math.round(distanceCm * 10) / 10,
    waterLevelCm: Math.round(waterLevelCm * 10) / 10,
    fillPercent: Math.round(fillPercent * 10) / 10,
    ageMs,
    receivedAt: new Date(),
    isValid,
    isStale,
    errorMessage: isBlindSpot
      ? 'Distance < 1cm (Sensor Blind Spot)'
      : isCapOff
        ? 'Echo Lost (Cap Removed or Empty Reflection)'
        : !isValid
          ? 'Sensor Reported Error'
          : undefined,
    rawPayload: obj,
  };

  return { success: true, data: reading };
}

/**
 * Determines bottle fill status label based on current percentage.
 */
export function getLiquidStatus(fillPercent: number, isValid: boolean): LiquidStatus {
  if (!isValid) return 'INVALID';
  if (fillPercent < 5) return 'EMPTY';
  if (fillPercent < 25) return 'LOW';
  if (fillPercent < 70) return 'MID';
  if (fillPercent < 90) return 'HIGH';
  return 'FULL';
}

/**
 * Estimates water volume in mL given current fill percentage and bottle capacity.
 */
export function calculateVolumeMl(fillPercent: number, capacityMl: number | null): number | null {
  if (!capacityMl || capacityMl <= 0) return null;
  const pct = Math.max(0, Math.min(100, fillPercent));
  return Math.round((pct / 100) * capacityMl);
}
