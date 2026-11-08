import React from 'react';
import { CalculationResult } from '../core/types';
import { formatNumber } from '../core/unit-converter';
import { Eye, ShieldCheck, Ruler } from 'lucide-react';

interface LandVisualizerProps {
  result: CalculationResult;
}

export const LandVisualizer: React.FC<LandVisualizerProps> = ({ result }) => {
  const { envelope, input_summary, theoretical } = result;

  const roadWidth = envelope.road_width_m;
  const frontSetback = envelope.road_setback_from_boundary_m;
  const sideSetback = envelope.boundary_side_back_setback_m;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              แผนภาพจำลองระนาบระยะร่นและเขตทาง (2D Envelope Schematic)
            </h3>
            <p className="text-xs text-slate-500">
              แสดงระยะร่นตามข้อบัญญัติ กทม. ข้อ 54 และระยะร่นขอบเขตที่ดิน
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
          ความสูงสูงสุด {envelope.max_building_height_at_front_m.toFixed(1)} ม.
        </div>
      </div>

      {/* 2D Canvas / SVG Diagram */}
      <div className="bg-slate-900 rounded-xl p-4 sm:p-6 text-white relative overflow-hidden flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 500 280"
          className="w-full max-w-lg h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="500" height="280" fill="#0f172a" />
          <rect width="500" height="280" fill="url(#grid)" />

          {/* 1. Public Road Zone (Bottom) */}
          <rect x="30" y="210" width="440" height="55" fill="#334155" rx="4" />
          {/* Road Centerline */}
          <line
            x1="30"
            y1="237"
            x2="470"
            y2="237"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <text x="250" y="242" fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">
            กึ่งกลางถนนสาธารณะ (Road Centerline)
          </text>
          <text x="250" y="258" fill="#94a3b8" fontSize="11" textAnchor="middle">
            ถนนสาธารณะกว้าง {roadWidth.toFixed(1)} เมตร
          </text>

          {/* 2. Property Boundary (Land Parcel) */}
          <rect
            x="70"
            y="30"
            width="360"
            height="180"
            fill="#1e293b"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 4"
            rx="4"
          />
          <text x="75" y="46" fill="#38bdf8" fontSize="10" fontWeight="bold">
            แนวเขตที่ดิน (Property Boundary)
          </text>

          {/* 3. Front Road Setback Line */}
          {frontSetback > 0 ? (
            <>
              <line
                x1="70"
                y1={210 - frontSetback * 15}
                x2="430"
                y2={210 - frontSetback * 15}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <rect
                x="70"
                y={210 - frontSetback * 15}
                width="360"
                height={frontSetback * 15}
                fill="#f43f5e"
                fillOpacity="0.15"
              />
              <text
                x="250"
                y={210 - (frontSetback * 15) / 2 + 3}
                fill="#f43f5e"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                ร่นจากแนวเขตที่ดิน {frontSetback.toFixed(2)} ม. (ข้อ 54)
              </text>
            </>
          ) : (
            <text x="250" y="200" fill="#10b981" fontSize="10" textAnchor="middle">
              ไม่ต้องร่นจากแนวเขตที่ดิน (ร่นจากกึ่งกลางถนนแล้วพ้นเขตทาง)
            </text>
          )}

          {/* 4. Buildable Footprint Envelope */}
          <rect
            x={70 + sideSetback * 8}
            y={30 + sideSetback * 8}
            width={360 - 2 * (sideSetback * 8)}
            height={180 - (sideSetback * 8 + Math.max(frontSetback * 15, sideSetback * 8))}
            fill="#3b82f6"
            fillOpacity="0.4"
            stroke="#60a5fa"
            strokeWidth="2"
            rx="4"
          />
          <text
            x="250"
            y="110"
            fill="#ffffff"
            fontSize="12"
            textAnchor="middle"
            fontWeight="bold"
          >
            พื้นที่ขอบเขตก่อสร้างอาคาร (Buildable Footprint)
          </text>
          <text x="250" y="128" fill="#93c5fd" fontSize="10" textAnchor="middle">
            ร่นข้างและหลัง {sideSetback.toFixed(1)} ม.
          </text>

          {/* Height Indicator arrow */}
          <path d="M 445 210 L 445 70" stroke="#a855f7" strokeWidth="2" markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
            </marker>
          </defs>
          <text
            x="455"
            y="140"
            fill="#d8b4fe"
            fontSize="10"
            transform="rotate(90, 455, 140)"
            textAnchor="middle"
            fontWeight="bold"
          >
            H ≤ {envelope.max_building_height_at_front_m.toFixed(1)} ม.
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-300 mt-3 pt-3 border-t border-slate-800 w-full">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-sky-400 border-dashed" />
            <span>แนวเขตที่ดิน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500/30 border border-rose-500" />
            <span>ระยะร่นถนนสาธารณะ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-blue-500/40 border border-blue-400" />
            <span>ขอบเขต Footprint อาคาร</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400" />
            <span>กึ่งกลางถนน</span>
          </div>
        </div>
      </div>
    </div>
  );
};
