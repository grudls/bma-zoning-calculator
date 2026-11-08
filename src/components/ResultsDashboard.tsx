import React from 'react';
import { CalculationResult } from '../core/types';
import { formatNumber } from '../core/unit-converter';
import {
  Building2,
  Maximize2,
  TreePine,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface ResultsDashboardProps {
  result: CalculationResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  const { input_summary, theoretical, envelope } = result;

  const isFootprintRestricted = envelope.is_footprint_limited_by_setback;
  const effectiveFootprint =
    envelope.realistic_footprint_sqm !== undefined
      ? envelope.realistic_footprint_sqm
      : theoretical.max_footprint_sqm;

  return (
    <div className="space-y-6">
      {/* 1. Main KPI Cards (Apple Store Minimalist Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* KPI 1: Max GFA */}
        <div className="apple-card p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-[#86868B] mb-3">
            <span className="text-xs font-semibold tracking-tight text-[#48484A]">
              พื้นที่ก่อสร้างรวม (GFA)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono">
              {formatNumber(theoretical.max_gross_floor_area_sqm, 0)}
              <span className="text-xs font-normal text-[#86868B] ml-1">ตร.ม.</span>
            </div>
            <div className="text-[11px] font-medium text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded-full inline-block border border-amber-200/60 mt-1.5">
              FAR {theoretical.far.toFixed(1)} : 1
            </div>
          </div>
        </div>

        {/* KPI 2: Max Footprint / BCR */}
        <div
          className={`apple-card p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200 ${
            isFootprintRestricted ? 'ring-2 ring-amber-400/80 bg-gradient-to-b from-white to-[#FFFDF7]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-[#86868B] mb-3">
            <span className="text-xs font-semibold tracking-tight text-[#48484A]">
              พื้นที่ปกคลุมดิน (Footprint)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
              <Maximize2 className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono">
              {formatNumber(effectiveFootprint, 0)}
              <span className="text-xs font-normal text-[#86868B] ml-1">ตร.ม.</span>
            </div>
            {isFootprintRestricted ? (
              <div className="text-[11px] font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-amber-300/80 mt-1.5">
                <TrendingDown className="w-3 h-3 text-amber-700" />
                <span>จำกัดด้วยระยะร่น</span>
              </div>
            ) : (
              <div className="text-[11px] font-medium text-[#48484A] bg-[#F5F5F7] px-2 py-0.5 rounded-full inline-block border border-black/[0.04] mt-1.5">
                BCR {theoretical.max_bcr_percentage}%
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Min Open Space / OSR */}
        <div className="apple-card p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-[#86868B] mb-3">
            <span className="text-xs font-semibold tracking-tight text-[#48484A]">
              พื้นที่ว่างขั้นต่ำ (Open Space)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
              <TreePine className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono">
              {formatNumber(theoretical.min_open_space_sqm, 0)}
              <span className="text-xs font-normal text-[#86868B] ml-1">ตร.ม.</span>
            </div>
            <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200/60 mt-1.5">
              OSR {theoretical.osr_percentage}%
            </div>
          </div>
        </div>

        {/* KPI 4: Max Height & Floors */}
        <div className="apple-card p-5 sm:p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-[#86868B] mb-3">
            <span className="text-xs font-semibold tracking-tight text-[#48484A]">
              ความสูงสูงสุดริมเขตทาง
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] font-mono">
              {formatNumber(envelope.max_building_height_at_front_m, 1)}
              <span className="text-xs font-normal text-[#86868B] ml-1">ม.</span>
            </div>
            <div className="text-[11px] font-medium text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full inline-block border border-purple-200/60 mt-1.5">
              ไม่เกิน ~{envelope.estimated_max_floors} ชั้น (ข้อ 44)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Breakdown Grid (Tier 1 vs. Tier 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1 Box */}
        <div className="apple-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
                Tier 1: สิทธิตามทฤษฎีผังเมืองรวม
              </h3>
            </div>
            <span className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              ผังเมือง กทม. 2556
            </span>
          </div>

          <div className="space-y-3 text-xs divide-y divide-black/[0.03]">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">ประเภทและบริเวณผังสี:</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {input_summary.zone_code} ({input_summary.zone_name})
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">อัตราส่วนพื้นที่อาคารรวมต่อพื้นที่ดิน (FAR):</span>
              <span className="font-bold text-amber-700 font-mono text-sm">
                {theoretical.far.toFixed(1)} : 1
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">พื้นที่ก่อสร้างอาคารรวมสูงสุด (GFA):</span>
              <span className="font-bold text-[#1D1D1F] font-mono text-sm">
                {formatNumber(theoretical.max_gross_floor_area_sqm, 2)} ตร.ม.
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">อัตราส่วนพื้นที่ว่างต่อพื้นที่อาคารรวม (OSR):</span>
              <span className="font-semibold text-emerald-700 font-mono text-sm">
                {theoretical.osr_percentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">พื้นที่ว่างอันปราศจากสิ่งปกคลุมขั้นต่ำ:</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {formatNumber(theoretical.min_open_space_sqm, 2)} ตร.ม.
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">อัตราส่วนพื้นที่ปกคลุมดินสูงสุด (BCR):</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {theoretical.max_bcr_percentage}% ({formatNumber(theoretical.max_footprint_sqm, 2)} ตร.ม.)
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2 Box */}
        <div className="apple-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.04] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
              <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F]">
                Tier 2: ข้อจำกัดตามระยะร่นและเขตทาง
              </h3>
            </div>
            <span className="text-[11px] font-medium text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              ข้อบัญญัติ กทม. 2544
            </span>
          </div>

          <div className="space-y-3 text-xs divide-y divide-black/[0.03]">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">ความกว้างเขตทางถนนสาธารณะ:</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {envelope.road_width_m.toFixed(1)} เมตร
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">แนวร่นจากกึ่งกลางถนนสาธารณะ (ข้อ 54):</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {envelope.road_setback_from_center_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">ระยะร่นจากแนวเขตที่ดินด้านหน้าแปลง:</span>
              <span className="font-bold text-amber-700 font-mono text-sm">
                {envelope.road_setback_from_boundary_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">ระยะร่นแนวเขตที่ดินด้านข้างและด้านหลัง:</span>
              <span className="font-semibold text-[#1D1D1F] font-mono">
                {envelope.boundary_side_back_setback_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">ความสูงอาคารสูงสุดริมเขตทาง (ข้อ 44 สัดส่วน 1:2):</span>
              <span className="font-bold text-purple-700 font-mono text-sm">
                {envelope.max_building_height_at_front_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-[#86868B]">Footprint จริงตามเรขาคณิตแปลงที่ดิน:</span>
              <span className="font-semibold font-mono">
                {envelope.realistic_footprint_sqm !== undefined ? (
                  <span className={isFootprintRestricted ? 'text-amber-700 font-bold' : 'text-[#1D1D1F]'}>
                    {formatNumber(envelope.realistic_footprint_sqm, 2)} ตร.ม.
                  </span>
                ) : (
                  <span className="text-[#86868B] font-normal">
                    (กรอกโหมดมิติ กว้าง x ลึก เพื่อคำนวณ)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
