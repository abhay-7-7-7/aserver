import React, { useId } from 'react';
import { BottleCalibration, ConnectionStatus, LiquidStatus, WaterLevelReading } from '../types/telemetry';
import { getLiquidStatus } from '../utils/telemetryValidator';
import { AlertCircle, Droplets, Info } from 'lucide-react';

interface BottleVisualizationProps {
  reading: WaterLevelReading | null;
  connectionStatus: ConnectionStatus;
  calibration: BottleCalibration;
  isSimulatorMode: boolean;
}

export const BottleVisualization: React.FC<BottleVisualizationProps> = ({
  reading,
  connectionStatus,
  calibration,
  isSimulatorMode,
}) => {
  const clipId = useId();
  const waveId = useId();

  const isConnected = connectionStatus === 'CONNECTED' || isSimulatorMode;
  const isStale = connectionStatus === 'STALE' || (reading?.isStale ?? false);
  const isValid = (reading?.isValid ?? false) && isConnected;
  const fillPercent = reading ? Math.max(0, Math.min(100, reading.fillPercent)) : 0;
  const distanceCm = reading ? reading.distanceCm : 0;
  const waterLevelCm = reading ? reading.waterLevelCm : 0;

  const liquidStatus: LiquidStatus = reading
    ? getLiquidStatus(fillPercent, reading.isValid)
    : 'EMPTY';

  // SVG Geometry Constants (viewBox 0 0 320 540)
  // Inner cavity bounds where liquid can exist:
  const CAVITY_TOP_Y = 140; // Max fill line (100%)
  const CAVITY_BOTTOM_Y = 490; // Base of bottle (0%)
  const CAVITY_HEIGHT = CAVITY_BOTTOM_Y - CAVITY_TOP_Y; // 350px

  // Liquid height in SVG coordinates
  const liquidPixelHeight = (fillPercent / 100) * CAVITY_HEIGHT;
  const liquidSurfaceY = CAVITY_BOTTOM_Y - liquidPixelHeight;

  // Status badge color mapping
  const getStatusChip = () => {
    if (!reading || !isValid) {
      return (
        <span className="brutal-badge bg-brutal-red text-white">
          <AlertCircle className="w-3.5 h-3.5" />
          {reading?.errorMessage || 'NO SENSOR DATA'}
        </span>
      );
    }

    switch (liquidStatus) {
      case 'FULL':
        return <span className="brutal-badge bg-brutal-green text-black">STATUS: FULL (≥90%)</span>;
      case 'HIGH':
        return <span className="brutal-badge bg-brutal-cyan text-black">STATUS: HIGH (70-89%)</span>;
      case 'MID':
        return <span className="brutal-badge bg-brutal-yellow text-black">STATUS: MID (25-69%)</span>;
      case 'LOW':
        return <span className="brutal-badge bg-brutal-orange text-white">STATUS: LOW (5-24%)</span>;
      case 'EMPTY':
      default:
        return <span className="brutal-badge bg-brutal-pink text-white">STATUS: EMPTY (&lt;5%)</span>;
    }
  };

  return (
    <div className="brutal-card bg-brutal-white p-5 md:p-8 flex flex-col items-center">
      {/* Header bar within bottle panel */}
      <div className="w-full flex items-center justify-between pb-4 mb-4 border-b-3 border-black">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-brutal-blue" />
          <h2 className="font-display font-black text-xl md:text-2xl uppercase tracking-tight">
            HYDRO//DYNAMIC BOTTLE MONITOR
          </h2>
        </div>
        <div>{getStatusChip()}</div>
      </div>

      {/* Main visualization grid: Bottle SVG + Real-time Big Telemetry Readouts */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-center">
        {/* Left / Center: Interactive SVG Reusable Water Bottle */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
          {/* Subtle sensor echo cone visualization */}
          <div className="w-full max-w-[340px] md:max-w-[380px] relative">
            <svg
              viewBox="0 0 320 540"
              className="w-full h-auto drop-shadow-[6px_6px_0px_#000000]"
              aria-label={`Water bottle fill illustration: ${fillPercent}% full`}
            >
              <defs>
                {/* Clip path matching the interior cavity of the reusable bottle */}
                <clipPath id={clipId}>
                  <path
                    d="
                      M 60,160
                      C 60,145 70,140 85,140
                      L 235,140
                      C 250,140 260,145 260,160
                      L 260,470
                      C 260,485 250,490 235,490
                      L 85,490
                      C 70,490 60,485 60,470
                      Z
                    "
                  />
                </clipPath>

                {/* Linear gradient for depth within the water */}
                <linearGradient id={`${waveId}-water`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00E5FF" />
                  <stop offset="50%" stopColor="#00B4D8" />
                  <stop offset="100%" stopColor="#0077B6" />
                </linearGradient>

                {/* Stale / offline grey water gradient */}
                <linearGradient id={`${waveId}-stale`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>

                {/* Error warning stripes pattern */}
                <pattern id={`${waveId}-stripes`} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="10" height="20" fill="#FFE600" />
                  <rect x="10" width="10" height="20" fill="#000000" />
                </pattern>
              </defs>

              {/* 1. ULTRASONIC SENSOR CONE BEAMS (From Cap down to liquid surface) */}
              {isConnected && isValid && fillPercent < 98 && (
                <g opacity="0.45">
                  <line
                    x1="160"
                    y1="110"
                    x2="100"
                    y2={liquidSurfaceY}
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="160"
                    y1="110"
                    x2="220"
                    y2={liquidSurfaceY}
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="160"
                    y1="110"
                    x2="160"
                    y2={liquidSurfaceY}
                    stroke="#00E5FF"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                  />
                </g>
              )}

              {/* 2. REUSABLE BOTTLE BACKGROUND GLASS INTERIOR */}
              <rect
                x="60"
                y="140"
                width="200"
                height="350"
                rx="20"
                fill="#F8FAFC"
                stroke="#000000"
                strokeWidth="4"
              />

              {/* 3. CLIPPED WATER LIQUID REGION */}
              <g clipPath={`url(#${clipId})`}>
                {/* Background water body */}
                {isValid && (
                  <rect
                    x="50"
                    y={liquidSurfaceY}
                    width="220"
                    height={liquidPixelHeight + 20}
                    fill={isStale ? `url(#${waveId}-stale)` : `url(#${waveId}-water)`}
                    className="transition-all duration-700 ease-out"
                  />
                )}

                {/* Error pattern overlay if reading is invalid */}
                {!isValid && reading && (
                  <rect
                    x="50"
                    y="140"
                    width="220"
                    height="360"
                    fill={`url(#${waveId}-stripes)`}
                    opacity="0.35"
                  />
                )}

                {/* Animated wave crest along the surface */}
                {isValid && fillPercent > 0 && fillPercent < 100 && isConnected && !isStale && (
                  <path
                    d={`
                      M 50,${liquidSurfaceY}
                      Q 90,${liquidSurfaceY - 6} 130,${liquidSurfaceY}
                      T 210,${liquidSurfaceY}
                      T 270,${liquidSurfaceY}
                      L 270,${liquidSurfaceY + 12}
                      L 50,${liquidSurfaceY + 12}
                      Z
                    `}
                    fill="#38BDF8"
                    opacity="0.8"
                    className="animate-wave-slow transition-all duration-700 ease-out"
                  />
                )}

                {/* Subtle bubbles rising in water */}
                {isValid && fillPercent > 20 && isConnected && (
                  <g fill="#FFFFFF" opacity="0.6">
                    <circle cx="95" cy={liquidSurfaceY + 45} r="3" />
                    <circle cx="130" cy={liquidSurfaceY + 95} r="4.5" />
                    <circle cx="210" cy={liquidSurfaceY + 60} r="2.5" />
                    <circle cx="170" cy={liquidSurfaceY + 130} r="3.5" />
                  </g>
                )}

                {/* Left glass specular reflection strip */}
                <path
                  d="M 75,150 L 75,475"
                  stroke="#FFFFFF"
                  strokeWidth="8"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                <path
                  d="M 90,165 L 90,460"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </g>

              {/* 4. MEASUREMENT GRADATION MARKS & TICKS (Right Side) */}
              <g stroke="#000000" strokeWidth="2.5" opacity="0.85">
                {/* 100% / MAX Mark */}
                <line x1="230" y1="150" x2="258" y2="150" strokeWidth="3.5" />
                <text x="220" y="154" textAnchor="end" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  100% · {calibration.usableHeightCm}cm
                </text>

                {/* 75% Mark */}
                <line x1="240" y1="235" x2="258" y2="235" />
                <text x="232" y="239" textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  75%
                </text>

                {/* 50% Mark */}
                <line x1="235" y1="320" x2="258" y2="320" strokeWidth="3" />
                <text x="225" y="324" textAnchor="end" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  50% · {(calibration.usableHeightCm / 2).toFixed(1)}cm
                </text>

                {/* 25% Mark */}
                <line x1="240" y1="405" x2="258" y2="405" />
                <text x="232" y="409" textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  25%
                </text>

                {/* 0% Mark */}
                <line x1="230" y1="480" x2="258" y2="480" strokeWidth="3.5" />
                <text x="220" y="484" textAnchor="end" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  0% · EMPTY
                </text>

                {/* Intermediate minor ticks */}
                <line x1="248" y1="192" x2="258" y2="192" strokeWidth="1.5" />
                <line x1="248" y1="277" x2="258" y2="277" strokeWidth="1.5" />
                <line x1="248" y1="362" x2="258" y2="362" strokeWidth="1.5" />
                <line x1="248" y1="447" x2="258" y2="447" strokeWidth="1.5" />
              </g>

              {/* 5. HEAVY NEUBRUTALIST BOTTLE SILHOUETTE & NECK */}
              {/* Bottle Neck */}
              <rect
                x="115"
                y="100"
                width="90"
                height="42"
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth="4"
              />

              {/* Threaded collar */}
              <line x1="110" y1="125" x2="210" y2="125" stroke="#000000" strokeWidth="4" />

              {/* Ergonomic Cap with Sensor Housing */}
              <rect
                x="105"
                y="50"
                width="110"
                height="52"
                rx="6"
                fill="#FFE600"
                stroke="#000000"
                strokeWidth="4"
              />
              {/* Cap ribbed grip lines */}
              <line x1="125" y1="50" x2="125" y2="100" stroke="#000000" strokeWidth="3" />
              <line x1="145" y1="50" x2="145" y2="100" stroke="#000000" strokeWidth="3" />
              <line x1="160" y1="50" x2="160" y2="100" stroke="#000000" strokeWidth="3" />
              <line x1="175" y1="50" x2="175" y2="100" stroke="#000000" strokeWidth="3" />
              <line x1="195" y1="50" x2="195" y2="100" stroke="#000000" strokeWidth="3" />

              {/* Top Sensor Badge on Cap */}
              <rect
                x="130"
                y="26"
                width="60"
                height="26"
                rx="4"
                fill="#000000"
                stroke="#000000"
                strokeWidth="2"
              />
              {/* Ultrasonic transducer eyes */}
              <circle cx="148" cy="39" r="6" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="1.5" />
              <circle cx="172" cy="39" r="6" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="1.5" />

              {/* Main Outer Bottle Wall Outline */}
              <rect
                x="60"
                y="140"
                width="200"
                height="350"
                rx="20"
                fill="none"
                stroke="#000000"
                strokeWidth="4"
              />

              {/* Dynamic Fill Percent Badge in the center of the bottle */}
              <g transform="translate(160, 310)">
                <rect
                  x="-65"
                  y="-26"
                  width="130"
                  height="52"
                  fill="#FFFFFF"
                  stroke="#000000"
                  strokeWidth="3.5"
                  className="drop-shadow-[3px_3px_0px_#000000]"
                />
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fill="#000000"
                  fontFamily="Space Grotesk, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="28"
                >
                  {isValid ? `${fillPercent.toFixed(1)}%` : '--%'}
                </text>
              </g>

              {/* Bottle Cap label */}
              <text
                x="160"
                y="18"
                textAnchor="middle"
                fill="#000000"
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="10"
                letterSpacing="1"
              >
                HC-SR04 SENSOR
              </text>
            </svg>
          </div>
        </div>

        {/* Right: Giant Neubrutalist Telemetry Readout & Sensor Metrics */}
        <div className="lg:col-span-5 flex flex-col gap-4 w-full">
          {/* Main Huge Percentage Box */}
          <div className="brutal-card bg-brutal-yellow p-5 border-4 border-black shadow-brutal-lg">
            <span className="font-mono text-xs font-black uppercase tracking-wider text-black block mb-1">
              REAL-TIME LIQUID LEVEL
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-black text-6xl md:text-7xl tracking-tighter text-black">
                {isValid ? fillPercent.toFixed(1) : '--'}
              </span>
              <span className="font-mono font-black text-3xl text-black">%</span>
            </div>
            <div className="mt-3 pt-3 border-t-2 border-black flex items-center justify-between font-mono text-xs font-bold">
              <span>CALCULATED FILL:</span>
              <span className="bg-black text-white px-2 py-0.5 uppercase">
                {isValid ? liquidStatus : 'NO SIGNAL'}
              </span>
            </div>
          </div>

          {/* Dual Metrics: Water Height & Sensor Distance */}
          <div className="grid grid-cols-2 gap-3">
            {/* Water Height */}
            <div className="brutal-card bg-white p-4 border-3 border-black shadow-brutal">
              <span className="font-mono text-xs font-extrabold uppercase text-gray-600 block">
                WATER HEIGHT
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display font-black text-3xl md:text-4xl text-brutal-blue">
                  {isValid ? waterLevelCm.toFixed(1) : '--'}
                </span>
                <span className="font-mono text-xs font-bold">CM</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 block mt-1">
                From base of bottle
              </span>
            </div>

            {/* Sensor Distance */}
            <div className="brutal-card bg-white p-4 border-3 border-black shadow-brutal">
              <span className="font-mono text-xs font-extrabold uppercase text-gray-600 block">
                SENSOR DISTANCE
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-display font-black text-3xl md:text-4xl text-brutal-pink">
                  {isValid ? distanceCm.toFixed(1) : '--'}
                </span>
                <span className="font-mono text-xs font-bold">CM</span>
              </div>
              <span className="text-[11px] font-mono text-gray-500 block mt-1">
                From cap down to water
              </span>
            </div>
          </div>

          {/* Physical Interpretation Context Box */}
          <div className="bg-brutal-canvas border-3 border-black p-4 shadow-brutal text-xs font-mono">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Info className="w-4 h-4 text-black" />
              <span>SENSOR DYNAMICS</span>
            </div>
            <p className="text-gray-700 leading-relaxed">
              When full, distance approaches <span className="font-bold">{calibration.sensorBlindSpotCm} cm</span> (sensor blind-spot margin). When completely empty, distance reaches <span className="font-bold">{calibration.usableHeightCm} cm</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
