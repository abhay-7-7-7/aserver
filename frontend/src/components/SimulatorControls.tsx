import React from 'react';
import { BottleCalibration } from '../types/telemetry';
import { AlertOctagon, Play, Square, Wrench } from 'lucide-react';

interface SimulatorControlsProps {
  isSimulatorMode: boolean;
  onToggleSimulator: (enabled?: boolean) => void;
  simulatorDistance: number;
  onDistanceChange: (dist: number) => void;
  onPresetSelect: (preset: '0' | '25' | '50' | '75' | '100' | 'cycle' | 'error_blind' | 'error_echo') => void;
  cycleActive: boolean;
  calibration: BottleCalibration;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  isSimulatorMode,
  onToggleSimulator,
  simulatorDistance,
  onDistanceChange,
  onPresetSelect,
  cycleActive,
  calibration,
}) => {
  if (!isSimulatorMode) {
    return (
      <div className="bg-brutal-canvas border-2 border-dashed border-black p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-black" />
          <span>
            <strong>DEV TOOL:</strong> Hardware offline? Launch the interactive liquid level simulator to verify bottle animation & geometry.
          </span>
        </div>
        <button
          onClick={() => onToggleSimulator(true)}
          className="brutal-btn bg-brutal-yellow text-xs px-3 py-1 font-bold whitespace-nowrap"
        >
          LAUNCH SIMULATOR MODE
        </button>
      </div>
    );
  }

  return (
    <div className="brutal-card bg-brutal-yellow border-4 border-black p-5 mb-6 shadow-brutal-lg">
      {/* High-visibility Warning Banner */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b-3 border-black">
        <div className="flex items-center gap-2 font-display font-black text-sm md:text-base text-black uppercase">
          <AlertOctagon className="w-5 h-5 text-black animate-pulse" />
          <span>SIMULATION MODE ACTIVE — SYNTHETIC DATA (NOT FROM HARDWARE)</span>
        </div>
        <button
          onClick={() => onToggleSimulator(false)}
          className="brutal-btn bg-black text-white hover:bg-gray-800 text-xs px-3 py-1"
        >
          DISABLE SIMULATOR
        </button>
      </div>

      <div className="flex flex-col gap-4 font-mono text-xs">
        {/* Quick Test Presets Required by Deliverable 6 */}
        <div>
          <span className="font-extrabold text-black uppercase block mb-1.5">
            1. TEST PRESET LEVELS (DELIVERABLE 6 VERIFICATION):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPresetSelect('0')}
              className="brutal-btn bg-white hover:bg-pink-100 text-black px-3 py-1 text-xs"
            >
              0% (EMPTY · {calibration.usableHeightCm}cm)
            </button>
            <button
              onClick={() => onPresetSelect('25')}
              className="brutal-btn bg-white hover:bg-yellow-100 text-black px-3 py-1 text-xs"
            >
              25% (LOW)
            </button>
            <button
              onClick={() => onPresetSelect('50')}
              className="brutal-btn bg-white hover:bg-cyan-100 text-black px-3 py-1 text-xs"
            >
              50% (MID)
            </button>
            <button
              onClick={() => onPresetSelect('75')}
              className="brutal-btn bg-white hover:bg-blue-100 text-black px-3 py-1 text-xs"
            >
              75% (HIGH)
            </button>
            <button
              onClick={() => onPresetSelect('100')}
              className="brutal-btn bg-white hover:bg-green-100 text-black px-3 py-1 text-xs"
            >
              100% (FULL · {calibration.sensorBlindSpotCm}cm)
            </button>
            <button
              onClick={() => onPresetSelect('cycle')}
              className={`brutal-btn px-3 py-1 text-xs flex items-center gap-1 ${
                cycleActive ? 'bg-brutal-pink text-white' : 'bg-brutal-cyan text-black'
              }`}
            >
              {cycleActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {cycleActive ? 'STOP WAVE CYCLE' : 'ANIMATED FILL CYCLE'}
            </button>
          </div>
        </div>

        {/* Error State Simulation */}
        <div>
          <span className="font-extrabold text-black uppercase block mb-1.5">
            2. SIMULATE PHYSICAL ANOMALIES & SENSOR ERRORS:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPresetSelect('error_blind')}
              className="brutal-btn bg-brutal-red text-white hover:bg-red-600 px-3 py-1 text-xs"
            >
              BLIND SPOT (0.4cm &lt; 1cm ERROR)
            </button>
            <button
              onClick={() => onPresetSelect('error_echo')}
              className="brutal-btn bg-brutal-red text-white hover:bg-red-600 px-3 py-1 text-xs"
            >
              LOST ECHO (38cm &gt; MAX ERROR)
            </button>
          </div>
        </div>

        {/* Continuous Distance Scrubber */}
        <div className="bg-white border-2 border-black p-3 shadow-brutal-sm">
          <div className="flex justify-between items-center font-bold mb-1.5">
            <span>CONTINUOUS DISTANCE SCRUBBER:</span>
            <span className="bg-black text-white px-2 py-0.5">{simulatorDistance.toFixed(1)} CM</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="30"
            step="0.1"
            value={simulatorDistance}
            onChange={(e) => onDistanceChange(parseFloat(e.target.value))}
            className="w-full accent-black cursor-pointer h-2 bg-gray-200 border border-black"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1">
            <span>0.5cm (Full/Blind spot)</span>
            <span>{calibration.usableHeightCm}cm (Empty)</span>
            <span>30.0cm (Cap off)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
