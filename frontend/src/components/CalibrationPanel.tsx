import React from 'react';
import { BottleCalibration } from '../types/telemetry';
import { DEFAULT_CALIBRATION } from '../utils/telemetryValidator';
import { Cpu, HelpCircle, RotateCcw, Sliders, SlidersHorizontal } from 'lucide-react';

interface CalibrationPanelProps {
  calibration: BottleCalibration;
  onChangeCalibration: (newCal: BottleCalibration) => void;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  calibration,
  onChangeCalibration,
}) => {
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!Number.isNaN(val) && val >= 5 && val <= 50) {
      onChangeCalibration({
        ...calibration,
        usableHeightCm: val,
      });
    }
  };

  const handleBlindSpotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!Number.isNaN(val) && val >= 0.5 && val <= 10) {
      onChangeCalibration({
        ...calibration,
        sensorBlindSpotCm: val,
      });
    }
  };

  const handleModeToggle = (mode: 'FIRMWARE_AUTHORITATIVE' | 'CUSTOM_CALIBRATION') => {
    onChangeCalibration({
      ...calibration,
      mode,
    });
  };

  const handleReset = () => {
    onChangeCalibration(DEFAULT_CALIBRATION);
  };

  return (
    <div className="brutal-card bg-brutal-white p-5 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-3 border-black gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brutal-yellowDark" />
          <h3 className="font-display font-black text-lg md:text-xl uppercase tracking-tight">
            CALIBRATION & GEOMETRY PROFILES
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="brutal-badge bg-brutal-canvas text-black text-[11px]">
            {calibration.mode === 'FIRMWARE_AUTHORITATIVE' ? (
              <>
                <Cpu className="w-3 h-3 text-brutal-blue" />
                FIRMWARE AUTH (STM32)
              </>
            ) : (
              <>
                <Sliders className="w-3 h-3 text-brutal-pink" />
                BROWSER OVERRIDE
              </>
            )}
          </span>

          <button
            onClick={handleReset}
            className="brutal-btn bg-white hover:bg-gray-100 px-2 py-1 text-xs flex items-center gap-1"
            title="Reset to default 17cm setup"
          >
            <RotateCcw className="w-3 h-3" />
            RESET
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders and Input Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Mode Selector */}
          <div className="bg-brutal-canvas border-2 border-black p-3 shadow-brutal-sm">
            <span className="font-mono text-xs font-black uppercase text-black block mb-2">
              AUTHORITY SOURCE:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleModeToggle('FIRMWARE_AUTHORITATIVE')}
                className={`py-1.5 px-2 border-2 border-black font-mono text-xs font-bold transition-all ${
                  calibration.mode === 'FIRMWARE_AUTHORITATIVE'
                    ? 'bg-brutal-yellow shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                FIRMWARE AUTH (DEFAULT)
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle('CUSTOM_CALIBRATION')}
                className={`py-1.5 px-2 border-2 border-black font-mono text-xs font-bold transition-all ${
                  calibration.mode === 'CUSTOM_CALIBRATION'
                    ? 'bg-brutal-pink text-white shadow-brutal-sm translate-x-[-1px] translate-y-[-1px]'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                BROWSER RECALIBRATION
              </button>
            </div>
            <p className="text-[11px] font-mono text-gray-600 mt-2">
              {calibration.mode === 'FIRMWARE_AUTHORITATIVE'
                ? 'Display relies on the percentage and depth computed by the STM32 Blue Pill firmware.'
                : 'Display applies real-time recalculation in the browser based on custom height sliders.'}
            </p>
          </div>

          {/* Usable Height Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-mono text-xs font-bold">
              <span>USABLE BOTTLE HEIGHT (EMPTY DISTANCE):</span>
              <span className="bg-brutal-yellow border-2 border-black px-2 py-0.5">
                {calibration.usableHeightCm.toFixed(1)} CM
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="0.5"
              value={calibration.usableHeightCm}
              onChange={handleHeightChange}
              className="accent-black cursor-pointer h-3 bg-gray-200 border-2 border-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>5.0 cm (Small cup)</span>
              <span className="font-bold">17.0 cm (Standard Blue Pill setup)</span>
              <span>40.0 cm (Tall flask)</span>
            </div>
          </div>

          {/* Blind Spot Offset Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center font-mono text-xs font-bold">
              <span>SENSOR BLIND SPOT (FULL SENSOR OFFSET):</span>
              <span className="bg-brutal-cyan border-2 border-black px-2 py-0.5">
                {calibration.sensorBlindSpotCm.toFixed(1)} CM
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={calibration.sensorBlindSpotCm}
              onChange={handleBlindSpotChange}
              className="accent-black cursor-pointer h-3 bg-gray-200 border-2 border-black"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>1.0 cm (Theoretical min)</span>
              <span className="font-bold">2.0 cm (HC-SR04 acoustic dead-zone)</span>
              <span>5.0 cm (Recessed cap)</span>
            </div>
          </div>
        </div>

        {/* Math explanation card */}
        <div className="lg:col-span-5 bg-brutal-canvas border-3 border-black p-4 shadow-brutal flex flex-col justify-between font-mono text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-bold mb-2 pb-1 border-b-2 border-black">
              <HelpCircle className="w-4 h-4 text-black" />
              <span>SENSOR MATHEMATICS & PHYSIC LOGIC</span>
            </div>
            <div className="space-y-2 text-gray-800">
              <div className="bg-white border-2 border-black p-2 shadow-brutal-sm">
                <span className="font-extrabold block text-brutal-blue">1. WATER DEPTH:</span>
                <code>Water Height = Usable Height ({calibration.usableHeightCm}cm) − Measured Distance</code>
              </div>
              <div className="bg-white border-2 border-black p-2 shadow-brutal-sm">
                <span className="font-extrabold block text-brutal-pink">2. FILL PERCENTAGE:</span>
                <code>Fill % = [Water Height / ({calibration.usableHeightCm} − {calibration.sensorBlindSpotCm})] × 100</code>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t-2 border-black text-[11px] text-gray-600">
            <strong>NOTE:</strong> Changing calibration here modifies website display geometry and volume scaling. It does not flash the STM32 Blue Pill flash registers.
          </div>
        </div>
      </div>
    </div>
  );
};
