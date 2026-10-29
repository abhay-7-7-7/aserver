import React from 'react';
import { TelemetryHistoryItem } from '../types/telemetry';
import { Clock, History, Trash2 } from 'lucide-react';

interface HistorySectionProps {
  history: TelemetryHistoryItem[];
  onClearHistory: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onClearHistory,
}) => {
  // Generate SVG points for the timeline chart
  // History is ordered newest first, so we reverse it for left-to-right chronological chart
  const chronological = [...history].reverse();
  const chartWidth = 600;
  const chartHeight = 160;
  const padding = 20;

  const points = chronological.map((item, idx) => {
    const x =
      chronological.length <= 1
        ? chartWidth / 2
        : padding + (idx / (chronological.length - 1)) * (chartWidth - padding * 2);
    // In SVG, y=0 is top. 100% fill is near top, 0% is near bottom.
    const pct = Math.max(0, Math.min(100, item.fillPercent));
    const y = chartHeight - padding - (pct / 100) * (chartHeight - padding * 2);
    return { x, y, item };
  });

  const pathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${chartHeight - padding} L ${points[0].x.toFixed(1)},${chartHeight - padding} Z`
    : '';

  return (
    <div className="brutal-card bg-brutal-white p-5 md:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-3 border-black gap-2">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-brutal-pink" />
          <h3 className="font-display font-black text-lg md:text-xl uppercase tracking-tight">
            VOLATILE SESSION TELEMETRY HISTORY
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="brutal-badge bg-brutal-canvas text-black text-[11px]">
            <Clock className="w-3 h-3" />
            BROWSER-SESSION (MAX 50)
          </span>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="brutal-btn bg-white hover:bg-red-50 text-red-600 px-2 py-1 text-xs flex items-center gap-1"
              title="Clear in-memory session log"
            >
              <Trash2 className="w-3 h-3" />
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* SVG Session Trend Line Chart */}
      <div className="bg-brutal-canvas border-3 border-black p-4 mb-5 shadow-brutal">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-black uppercase text-gray-700">
            FILL LEVEL TREND (%) OVER CURRENT SESSION
          </span>
          <span className="font-mono text-xs font-bold text-gray-500">
            {history.length} READINGS RECORDED
          </span>
        </div>

        {points.length === 0 ? (
          <div className="h-36 flex items-center justify-center font-mono text-xs font-bold text-gray-400">
            Awaiting first telemetry packet...
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-40 overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#000000" strokeWidth="2" />

              {/* Grid Labels */}
              <text x={padding - 4} y={padding + 4} textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="bold">100%</text>
              <text x={padding - 4} y={chartHeight / 2 + 3} textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="bold">50%</text>
              <text x={padding - 4} y={chartHeight - padding + 3} textAnchor="end" fontSize="10" fontFamily="monospace" fontWeight="bold">0%</text>

              {/* Shaded Area Under Curve */}
              <path d={areaD} fill="#00E5FF" opacity="0.25" />

              {/* Main Stepped/Smooth Telemetry Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#000000"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Individual Data Points */}
              {points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={idx === points.length - 1 ? 5 : 3}
                  fill={idx === points.length - 1 ? '#FFE600' : '#00E5FF'}
                  stroke="#000000"
                  strokeWidth="2"
                />
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Recent Readings Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-black text-white text-left uppercase">
              <th className="p-2 border-2 border-black">TIME</th>
              <th className="p-2 border-2 border-black">SENSOR DISTANCE</th>
              <th className="p-2 border-2 border-black">WATER DEPTH</th>
              <th className="p-2 border-2 border-black">FILL %</th>
              <th className="p-2 border-2 border-black">INTEGRITY</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 border-2 border-black">
                  No telemetry logged yet this session.
                </td>
              </tr>
            ) : (
              history.slice(0, 8).map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-2 border-black ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-brutal-canvas'
                  } hover:bg-yellow-50`}
                >
                  <td className="p-2 border-2 border-black font-bold">{item.timeLabel}</td>
                  <td className="p-2 border-2 border-black">{item.distanceCm.toFixed(1)} cm</td>
                  <td className="p-2 border-2 border-black">{item.waterLevelCm.toFixed(1)} cm</td>
                  <td className="p-2 border-2 border-black font-extrabold">{item.fillPercent.toFixed(1)}%</td>
                  <td className="p-2 border-2 border-black">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold uppercase border border-black ${
                        item.isValid ? 'bg-brutal-green text-black' : 'bg-brutal-pink text-white'
                      }`}
                    >
                      {item.isValid ? 'VALID' : 'CORRUPT/ERR'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
