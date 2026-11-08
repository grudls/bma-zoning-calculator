import React from 'react';
import { CalculationResult } from '../core/types';
import { formatNumber } from '../core/unit-converter';
import {
  Building2,
  Maximize2,
  TreePine,
  ArrowUpRight,
  TrendingDown,
  Layers,
  Info,
  CheckCircle,
} from 'lucide-react';

interface ResultsDashboardProps {
  result: CalculationResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  const { input_summary, theoretical, envelope, gatekeeper } = result;

  const isFootprintRestricted = envelope.is_footprint_limited_by_setback;
  const effectiveFootprint =
    envelope.realistic_footprint_sqm !== undefined
      ? envelope.realistic_footprint_sqm
      : theoretical.max_footprint_sqm;

  return (
    <div className="space-y-6">
      {/* 1. Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Max GFA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">พื้นที่ก่อสร้างรวมสูงสุด (GFA)</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatNumber(theoretical.max_gross_floor_area_sqm, 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">ตร.ม.</span>
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              FAR {theoretical.far.toFixed(1)} เท่าของพื้นที่ดิน
            </div>
          </div>
        </div>

        {/* KPI 2: Max Footprint / BCR */}
        <div
          className={`rounded-2xl border p-4 sm:p-5 shadow-sm flex flex-col justify-between ${
            isFootprintRestricted
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">พื้นที่ปกคลุมดิน (Footprint)</span>
            <div
              className={`p-1.5 rounded-lg ${
                isFootprintRestricted
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatNumber(effectiveFootprint, 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">ตร.ม.</span>
            </div>
            {isFootprintRestricted ? (
              <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>จำกัดด้วยระยะร่น (ทฤษฎี {formatNumber(theoretical.max_footprint_sqm, 0)} ตร.ม.)</span>
              </div>
            ) : (
              <div className="text-[11px] text-indigo-600 font-medium mt-1">
                BCR {theoretical.max_bcr_percentage}% ของพื้นที่ดิน
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Min Open Space / OSR */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">พื้นที่ว่างขั้นต่ำ (Open Space)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TreePine className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatNumber(theoretical.min_open_space_sqm, 0)}
              <span className="text-xs font-normal text-slate-500 ml-1">ตร.ม.</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              OSR {theoretical.osr_percentage}% ของพื้นที่อาคารรวม
            </div>
          </div>
        </div>

        {/* KPI 4: Max Height & Floors */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">ความสูงสูงสุดริมเขตทาง</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {formatNumber(envelope.max_building_height_at_front_m, 1)}
              <span className="text-xs font-normal text-slate-500 ml-1">ม.</span>
            </div>
            <div className="text-[11px] text-purple-600 font-medium mt-1">
              ประมาณการไม่เกิน {envelope.estimated_max_floors} ชั้น (ข้อ 44)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detailed Breakdown Grid (Tier 1 vs. Tier 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier 1 Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Tier 1: สิทธิตามทฤษฎีผังเมืองรวม (Comprehensive Plan)
              </h3>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              ผังเมือง กทม. 2556
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">ประเภทและบริเวณผังสี:</span>
              <span className="font-bold text-slate-900 font-mono">
                {input_summary.zone_code} ({input_summary.zone_name})
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">อัตราส่วนพื้นที่อาคารรวมต่อพื้นที่ดิน (FAR):</span>
              <span className="font-bold text-blue-600 font-mono text-sm">
                {theoretical.far.toFixed(1)} : 1
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">พื้นที่ก่อสร้างอาคารรวมสูงสุด (GFA):</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatNumber(theoretical.max_gross_floor_area_sqm, 2)} ตร.ม.
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">อัตราส่วนพื้นที่ว่างต่อพื้นที่อาคารรวม (OSR):</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">
                {theoretical.osr_percentage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">พื้นที่ว่างอันปราศจากสิ่งปกคลุมขั้นต่ำ:</span>
              <span className="font-bold text-slate-900 font-mono">
                {formatNumber(theoretical.min_open_space_sqm, 2)} ตร.ม.
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">อัตราส่วนพื้นที่ปกคลุมดินสูงสุด (BCR):</span>
              <span className="font-bold text-indigo-600 font-mono">
                {theoretical.max_bcr_percentage}% ({formatNumber(theoretical.max_footprint_sqm, 2)} ตร.ม.)
              </span>
            </div>
          </div>
        </div>

        {/* Tier 2 Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Tier 2: ข้อจำกัดตามระยะร่นและเขตทาง (Building Envelope)
              </h3>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ข้อบัญญัติ กทม. 2544
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">ความกว้างเขตทางถนนสาธารณะ:</span>
              <span className="font-bold text-slate-900 font-mono">
                {envelope.road_width_m.toFixed(1)} เมตร
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">แนวร่นจากกึ่งกลางถนนสาธารณะ (ข้อ 54):</span>
              <span className="font-bold text-slate-900 font-mono">
                {envelope.road_setback_from_center_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">ระยะร่นจากแนวเขตที่ดินด้านหน้าแปลง:</span>
              <span className="font-bold text-amber-700 font-mono text-sm">
                {envelope.road_setback_from_boundary_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">ระยะร่นแนวเขตที่ดินด้านข้างและด้านหลัง:</span>
              <span className="font-bold text-slate-900 font-mono">
                {envelope.boundary_side_back_setback_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-slate-600">ความสูงอาคารสูงสุดริมเขตทาง (ข้อ 44 อัตราส่วน 1:2):</span>
              <span className="font-bold text-purple-700 font-mono text-sm">
                {envelope.max_building_height_at_front_m.toFixed(2)} เมตร
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Footprint จริงตามเรขาคณิตแปลงที่ดิน:</span>
              <span className="font-bold font-mono">
                {envelope.realistic_footprint_sqm !== undefined ? (
                  <span className={isFootprintRestricted ? 'text-amber-700 font-bold' : 'text-slate-900'}>
                    {formatNumber(envelope.realistic_footprint_sqm, 2)} ตร.ม.
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal">
                    (กรอกโหมด 'มิติ กว้าง x ลึก' เพื่อคำนวณ)
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
