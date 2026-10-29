import { describe, it, expect } from 'vitest';
import {
  validateAndParseReading,
  getLiquidStatus,
  calculateVolumeMl,
} from '../utils/telemetryValidator';

describe('telemetryValidator', () => {
  it('correctly parses valid camelCase payload from ESP32', () => {
    const raw = {
      device: 'WaterBottleMonitor',
      online: true,
      status: 'LIVE',
      distanceCm: 5.2,
      waterLevelCm: 11.8,
      fillPercent: 69.4,
      ageMs: 150,
    };

    const res = validateAndParseReading(raw);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.distanceCm).toBe(5.2);
    expect(res.data?.waterLevelCm).toBe(11.8);
    expect(res.data?.fillPercent).toBe(69.4);
    expect(res.data?.isValid).toBe(true);
    expect(res.data?.isStale).toBe(false);
    expect(res.data?.device).toBe('WaterBottleMonitor');
  });

  it('correctly parses snake_case payload from firmware', () => {
    const raw = {
      distance_cm: 4.5,
      level_percent: 72,
      valid: true,
      stale: false,
      status: 'Connected',
      age_ms: 200,
    };

    const res = validateAndParseReading(raw);
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.distanceCm).toBe(4.5);
    expect(res.data?.fillPercent).toBe(72);
    expect(res.data?.isValid).toBe(true);
  });

  it('rejects non-object and null payloads', () => {
    expect(validateAndParseReading(null).success).toBe(false);
    expect(validateAndParseReading('hello').success).toBe(false);
    expect(validateAndParseReading([1, 2, 3]).success).toBe(false);
  });

  it('rejects negative distance readings', () => {
    const res = validateAndParseReading({ distanceCm: -5.0 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Negative');
  });

  it('rejects distance beyond ultrasonic max limit (400cm)', () => {
    const res = validateAndParseReading({ distanceCm: 450 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('ultrasonic sensor maximum limit');
  });

  it('detects sensor blind spot (<1cm) as invalid measurement', () => {
    const res = validateAndParseReading({ distanceCm: 0.5, online: true });
    expect(res.success).toBe(true);
    expect(res.data?.isValid).toBe(false);
    expect(res.data?.errorMessage).toContain('Blind Spot');
  });

  it('detects cap removed or lost echo (>1.8 * usable height)', () => {
    const res = validateAndParseReading({ distanceCm: 35.0, online: true });
    expect(res.success).toBe(true);
    expect(res.data?.isValid).toBe(false);
    expect(res.data?.errorMessage).toContain('Echo Lost');
  });

  it('accurately calculates level in CUSTOM_CALIBRATION mode', () => {
    const customCalibration = {
      usableHeightCm: 20.0,
      sensorBlindSpotCm: 2.0,
      bottleCapacityMl: 1000,
      mode: 'CUSTOM_CALIBRATION' as const,
    };

    // When measured distance is 2.0 cm (full to sensor blind spot)
    const resFull = validateAndParseReading({ distanceCm: 2.0 }, customCalibration);
    expect(resFull.data?.fillPercent).toBe(100);
    expect(resFull.data?.waterLevelCm).toBe(18.0);

    // When measured distance is 20.0 cm (empty bottle)
    const resEmpty = validateAndParseReading({ distanceCm: 20.0 }, customCalibration);
    expect(resEmpty.data?.fillPercent).toBe(0);
    expect(resEmpty.data?.waterLevelCm).toBe(0);
  });

  it('correctly maps liquid status thresholds', () => {
    expect(getLiquidStatus(2, true)).toBe('EMPTY');
    expect(getLiquidStatus(15, true)).toBe('LOW');
    expect(getLiquidStatus(50, true)).toBe('MID');
    expect(getLiquidStatus(80, true)).toBe('HIGH');
    expect(getLiquidStatus(95, true)).toBe('FULL');
    expect(getLiquidStatus(95, false)).toBe('INVALID');
  });

  it('calculates volume accurately based on capacity', () => {
    expect(calculateVolumeMl(50, 1000)).toBe(500);
    expect(calculateVolumeMl(75, 750)).toBe(563);
    expect(calculateVolumeMl(100, null)).toBeNull();
  });
});
