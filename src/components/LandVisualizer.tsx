import React from 'react';
import { CalculationResult } from '../core/types';
import { Eye } from 'lucide-react';

interface LandVisualizerProps {
  result: CalculationResult;
}

export const LandVisualizer: React.FC<LandVisualizerProps> = ({ result }) => {
  const { envelope } = result;

  const roadWidth = envelope.road_width_m;
  const frontSetback = envelope.road_setback_from_boundary_m;
  const sideSetback = envelope.boundary_side_back_setback_m;

  return (
    <div className="apple-card p-6 space-y-5 transition-all">
      <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
            <Eye className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
              แผนภาพจำลองระนาบระยะร่นและเขตทาง (2D Envelope Schematic)
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              ระยะร่นถนนสาธารณะตามข้อบัญญัติ กทม. ข้อ 54 และระยะร่นรอบแปลงที่ดิน
            </p>
          </div>
        </div>

        <div className="text-xs font-mono font-semibold text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          ความสูงสูงสุด {envelope.max_building_height_at_front_m.toFixed(1)} ม.
        </div>
      </div>

      {/* 2D Clean Architectural Canvas (Apple Minimalist Aesthetic) */}
      <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-6 border border-black/[0.05] relative overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]">
        <svg
          viewBox="0 0 500 280"
          className="w-full max-w-lg h-auto select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Architectural Grid */}
          <defs>
            <pattern id="light-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.8" />
            </pattern>
            <filter id="soft-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97706" />
            </marker>
          </defs>

          <rect width="500" height="280" fill="#F8F9FA" />
          <rect width="500" height="280" fill="url(#light-grid)" />

          {/* 1. Public Road Zone (Bottom) */}
          <rect x="30" y="210" width="440" height="55" fill="#E2E8F0" rx="8" stroke="#CBD5E1" strokeWidth="1" />
          
          {/* Road Centerline */}
          <line
            x1="30"
            y1="237"
            x2="470"
            y2="237"
            stroke="#D97706"
            strokeWidth="2"
            strokeDasharray="8 6"
          />
          <text x="250" y="233" fill="#B45309" fontSize="9" textAnchor="middle" fontWeight="600" letterSpacing="0.5">
            กึ่งกลางถนนสาธารณะ (ROAD CENTERLINE)
          </text>
          <text x="250" y="254" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="500">
            ถนนสาธารณะกว้าง {roadWidth.toFixed(1)} เมตร
          </text>

          {/* 2. Property Boundary (Land Parcel) */}
          <rect
            x="70"
            y="30"
            width="360"
            height="180"
            fill="#FFFFFF"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            rx="8"
            filter="url(#soft-shadow)"
          />
          <text x="82" y="48" fill="#475569" fontSize="10" fontWeight="600">
            แนวเขตที่ดิน (PROPERTY BOUNDARY)
          </text>

          {/* 3. Front Road Setback Line */}
          {frontSetback > 0 ? (
            <>
              <line
                x1="70"
                y1={210 - frontSetback * 15}
                x2="430"
                y2={210 - frontSetback * 15}
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <rect
                x="70"
                y={210 - frontSetback * 15}
                width="360"
                height={frontSetback * 15}
                fill="#FFE4E6"
                fillOpacity="0.65"
              />
              <text
                x="250"
                y={210 - (frontSetback * 15) / 2 + 3}
                fill="#BE123C"
                fontSize="10"
                textAnchor="middle"
                fontWeight="600"
              >
                ร่นจากแนวเขตที่ดิน {frontSetback.toFixed(2)} ม. (ข้อ 54)
              </text>
            </>
          ) : (
            <text x="250" y="198" fill="#059669" fontSize="10" textAnchor="middle" fontWeight="500">
              ไม่ต้องร่นจากแนวเขตที่ดิน (ร่นจากกึ่งกลางถนนพ้นเขตทางแล้ว)
            </text>
          )}

          {/* 4. Buildable Footprint Envelope (Warm Amber / Slate Tactile Relief) */}
          <rect
            x={70 + sideSetback * 8}
            y={30 + sideSetback * 8}
            width={360 - 2 * (sideSetback * 8)}
            height={180 - (sideSetback * 8 + Math.max(frontSetback * 15, sideSetback * 8))}
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="1.8"
            rx="6"
            filter="url(#soft-shadow)"
          />
          <text
            x="250"
            y="110"
            fill="#78350F"
            fontSize="12"
            textAnchor="middle"
            fontWeight="700"
          >
            พื้นที่ขอบเขตก่อสร้างอาคาร (BUILDABLE FOOTPRINT)
          </text>
          <text x="250" y="127" fill="#92400E" fontSize="10" textAnchor="middle" fontWeight="500">
            ร่นข้างและหลัง {sideSetback.toFixed(1)} ม.
          </text>

          {/* Height Indicator vertical line */}
          <line x1="446" y1="210" x2="446" y2="70" stroke="#D97706" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <line x1="442" y1="210" x2="450" y2="210" stroke="#D97706" strokeWidth="1.5" />
          <text
            x="458"
            y="140"
            fill="#B45309"
            fontSize="10"
            transform="rotate(90, 458, 140)"
            textAnchor="middle"
            fontWeight="600"
          >
            H ≤ {envelope.max_building_height_at_front_m.toFixed(1)} ม.
          </text>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#48484A] mt-4 pt-3.5 border-t border-black/[0.05] w-full">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-slate-400 border-dashed bg-white" />
            <span className="font-medium">แนวเขตที่ดิน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#FFE4E6] border border-rose-400" />
            <span className="font-medium">ระยะร่นถนนสาธารณะ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#FEF3C7] border border-amber-500" />
            <span className="font-medium">กรอบ Footprint อาคาร</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-600" />
            <span className="font-medium">กึ่งกลางถนน</span>
          </div>
        </div>
      </div>
    </div>
  );
};
