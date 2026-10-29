import React, { useState } from 'react';
import { BottleCalibration, WaterLevelReading } from '../types/telemetry';
import { calculateVolumeMl } from '../utils/telemetryValidator';
import { ArrowDown, Check, Gauge, Ruler, Settings } from 'lucide-react';

interface StatCardsProps {
  reading: WaterLevelReading | null;
  calibration: BottleCalibration;
  onUpdateCalibration: (newCalibration: BottleCalibration) => void;
  isValid: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({
  reading,
  calibration,
  onUpdateCalibration,
  isValid,
}) => {
  const [isEditingCapacity, setIsEditingCapacity] = useState(false);
  const [capacityInput, setCapacityInput] = useState(String(calibration.bottleCapacityMl || 750));

  const fillPercent = reading && isValid ? reading.fillPercent : 0;
  const waterLevelCm = reading && isValid ? reading.waterLevelCm : 0;
  const distanceCm = reading && isValid ? reading.distanceCm : 0;

  const currentVolumeMl = isValid
    ? calculateVolumeMl(fillPercent, calibration.bottleCapacityMl)
    : null;

  const handleSaveCapacity = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(capacityInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      onUpdateCalibration({
        ...calibration,
        bottleCapacityMl: parsed,
      });
    } else {
      onUpdateCalibration({
        ...calibration,
        bottleCapacityMl: null,
      });
    }
    setIsEditingCapacity(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. FILL PERCENTAGE CARD */}
      <div className="brutal-card bg-brutal-yellow p-4 border-3 border-black shadow-brutal flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
            FILL LEVEL
          </span>
          <Gauge className="w-4 h-4 text-black" />
        </div>
        <div className="my-2">
          <span className="font-display font-black text-4xl text-black">
            {isValid ? fillPercent.toFixed(1) : '--'}
          </span>
          <span className="font-mono font-bold text-lg text-black ml-1">%</span>
        </div>
        {/* Neubrutalist Segmented Progress Bar */}
        <div className="w-full bg-white border-2 border-black h-4 p-0.5 overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-500 ease-out"
            style={{ width: `${isValid ? fillPercent : 0}%` }}
          />
        </div>
      </div>

      {/* 2. WATER HEIGHT IN CM */}
      <div className="brutal-card bg-brutal-cyan p-4 border-3 border-black shadow-brutal flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
            WATER DEPTH
          </span>
          <Ruler className="w-4 h-4 text-black" />
        </div>
        <div className="my-2">
          <span className="font-display font-black text-4xl text-black">
            {isValid ? waterLevelCm.toFixed(1) : '--'}
          </span>
          <span className="font-mono font-bold text-lg text-black ml-1">CM</span>
        </div>
        <span className="font-mono text-xs font-bold text-black opacity-80">
          ≈ {isValid ? (waterLevelCm * 0.3937).toFixed(1) : '--'} INCHES
        </span>
      </div>

      {/* 3. SENSOR DISTANCE */}
      <div className="brutal-card bg-brutal-pink p-4 border-3 border-black shadow-brutal flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-white">
            SENSOR HEADSPACE
          </span>
          <ArrowDown className="w-4 h-4 text-white" />
        </div>
        <div className="my-2">
          <span className="font-display font-black text-4xl text-white">
            {isValid ? distanceCm.toFixed(1) : '--'}
          </span>
          <span className="font-mono font-bold text-lg text-white ml-1">CM</span>
        </div>
        <span className="font-mono text-xs font-bold text-white opacity-90">
          CAP TO LIQUID SURFACE
        </span>
      </div>

      {/* 4. ESTIMATED VOLUME (ONLY IF CONFIGURED) */}
      <div className="brutal-card bg-brutal-green p-4 border-3 border-black shadow-brutal flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
            CONTAINER VOLUME
          </span>
          <button
            onClick={() => setIsEditingCapacity(!isEditingCapacity)}
            className="hover:rotate-45 transition-transform"
            title="Configure Bottle Capacity"
          >
            <Settings className="w-4 h-4 text-black" />
          </button>
        </div>

        {isEditingCapacity ? (
          <form onSubmit={handleSaveCapacity} className="my-2 flex items-center gap-1">
            <input
              type="number"
              value={capacityInput}
              onChange={(e) => setCapacityInput(e.target.value)}
              placeholder="e.g. 750"
              className="brutal-input text-xs w-24 py-1 px-1.5"
              autoFocus
            />
            <span className="font-mono text-xs font-bold">mL</span>
            <button
              type="submit"
              className="brutal-btn p-1 bg-black text-white hover:bg-gray-800 text-xs"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : calibration.bottleCapacityMl ? (
          <div className="my-2">
            <span className="font-display font-black text-4xl text-black">
              {isValid && currentVolumeMl !== null ? currentVolumeMl : '--'}
            </span>
            <span className="font-mono font-bold text-xs text-black ml-1">
              / {calibration.bottleCapacityMl} mL
            </span>
          </div>
        ) : (
          <div className="my-2">
            <span className="font-mono text-xs font-bold text-black block">
              NOT CALIBRATED
            </span>
            <button
              onClick={() => setIsEditingCapacity(true)}
              className="text-[11px] underline font-mono font-extrabold text-black hover:text-blue-900 mt-1"
            >
              Set volume (mL)
            </button>
          </div>
        )}

        <span className="font-mono text-xs font-bold text-black opacity-80">
          {calibration.bottleCapacityMl
            ? `${((fillPercent / 100) * (calibration.bottleCapacityMl / 1000)).toFixed(2)} LITERS`
            : 'Capacity not configured'}
        </span>
      </div>
    </div>
  );
};
