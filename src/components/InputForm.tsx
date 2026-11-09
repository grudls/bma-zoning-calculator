import React from 'react';
import { UserInput, ZoneConfig, TypologyConfig } from '../core/types';
import {
  formatNumber,
  raiNganWahToSqm,
  sqmToRaiNganWah,
  deriveDimensionsFromSqm,
  formatThaiArea,
} from '../core/unit-converter';
import { Ruler, MapPin, Compass, Building, Check } from 'lucide-react';

interface InputFormProps {
  input: UserInput;
  onChange: (updated: UserInput) => void;
  zones: Record<string, ZoneConfig>;
  typologies: Record<string, TypologyConfig>;
}

export const InputForm: React.FC<InputFormProps> = ({
  input,
  onChange,
  zones,
  typologies,
}) => {
  const currentTotalSqm =
    input.input_mode === 'TOTAL_AREA'
      ? raiNganWahToSqm(
          input.total_area?.rai || 0,
          input.total_area?.ngan || 0,
          input.total_area?.sqwah || 0
        )
      : Math.round(((input.dimensions?.width_frontage_m || 0) * (input.dimensions?.depth_m || 0)) * 100) / 100;

  const currentThaiUnits = sqmToRaiNganWah(currentTotalSqm);
  const currentDimensions = deriveDimensionsFromSqm(currentTotalSqm, input.dimensions);

  const selectedZone = zones[input.selected_zone_key] || zones['Y4'];

  const roadWidthPresets = [
    { label: '4ม. (ซอยแคบ)', width: 4.0 },
    { label: '6ม. (เกณฑ์คอนโด)', width: 6.0 },
    { label: '8ม.', width: 8.0 },
    { label: '10ม. (เกณฑ์อาคารสูง)', width: 10.0 },
    { label: '12ม.', width: 12.0 },
    { label: '18ม. (ถนนหลัก)', width: 18.0 },
  ];

  // Two-way synchronization handlers
  const handleTotalAreaChange = (updatedArea: { rai: number; ngan: number; sqwah: number }) => {
    const newSqm = raiNganWahToSqm(updatedArea.rai, updatedArea.ngan, updatedArea.sqwah);
    const syncedDimensions = deriveDimensionsFromSqm(newSqm, input.dimensions);
    onChange({
      ...input,
      input_mode: 'TOTAL_AREA',
      total_area: updatedArea,
      dimensions: syncedDimensions,
    });
  };

  const handleDimensionsChange = (updatedDims: { width_frontage_m: number; depth_m: number }) => {
    const newSqm = Math.max(0, updatedDims.width_frontage_m) * Math.max(0, updatedDims.depth_m);
    const syncedThai = sqmToRaiNganWah(newSqm);
    onChange({
      ...input,
      input_mode: 'DIMENSIONS',
      dimensions: updatedDims,
      total_area: {
        rai: syncedThai.rai,
        ngan: syncedThai.ngan,
        sqwah: syncedThai.sqwah,
      },
    });
  };

  const handleSwitchMode = (mode: 'TOTAL_AREA' | 'DIMENSIONS') => {
    if (mode === 'DIMENSIONS') {
      const sqm = raiNganWahToSqm(
        input.total_area?.rai || 0,
        input.total_area?.ngan || 0,
        input.total_area?.sqwah || 0
      );
      const syncedDims = deriveDimensionsFromSqm(sqm, input.dimensions);
      onChange({
        ...input,
        input_mode: 'DIMENSIONS',
        dimensions: syncedDims,
      });
    } else {
      const sqm = (input.dimensions?.width_frontage_m || 0) * (input.dimensions?.depth_m || 0);
      const syncedThai = sqmToRaiNganWah(sqm);
      onChange({
        ...input,
        input_mode: 'TOTAL_AREA',
        total_area: {
          rai: syncedThai.rai,
          ngan: syncedThai.ngan,
          sqwah: syncedThai.sqwah,
        },
      });
    }
  };

  return (
    <div className="apple-card p-6 sm:p-7 space-y-7 transition-all">
      {/* Header & Dual Input Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] pb-5">
        <div>
          <h2 className="text-base font-semibold text-[#1D1D1F] tracking-tight">
            กำหนดข้อมูลแปลงที่ดิน
          </h2>
          <p className="text-xs text-[#86868B] mt-0.5">
            เชื่อมโยงขนาดที่ดิน ไร่-งาน-วา และมิติ กว้าง x ลึก อัตโนมัติ (Two-way Sync)
          </p>
        </div>

        {/* Tactile Inset Track (Apple-style switch) */}
        <div className="tactile-track rounded-full p-1.5 inline-flex items-center self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleSwitchMode('TOTAL_AREA')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
              input.input_mode === 'TOTAL_AREA'
                ? 'bg-white text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] font-semibold ring-1 ring-amber-400/50'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            ไร่ - งาน - ตร.ว.
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('DIMENSIONS')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
              input.input_mode === 'DIMENSIONS'
                ? 'bg-white text-[#1D1D1F] shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] font-semibold ring-1 ring-amber-400/50'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            มิติ กว้าง x ลึก
          </button>
        </div>
      </div>

      {/* 1. Land Inputs */}
      {input.input_mode === 'TOTAL_AREA' ? (
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-amber-500" />
              <span>ขนาดพื้นที่ดิน (มาตราวัดไทย)</span>
            </label>
            <span className="text-xs font-mono font-medium text-[#48484A] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.04]">
              {formatNumber(currentTotalSqm, 0)} ตร.ม. ({formatNumber(currentTotalSqm / 4, 1)} ตร.ว.) • มิติ ~{currentDimensions.width_frontage_m}×{currentDimensions.depth_m} ม.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#86868B] pl-1">ไร่</span>
              <input
                type="number"
                min="0"
                step="1"
                value={input.total_area?.rai ?? 0}
                onChange={(e) =>
                  handleTotalAreaChange({
                    rai: Math.max(0, parseInt(e.target.value) || 0),
                    ngan: input.total_area?.ngan ?? 0,
                    sqwah: input.total_area?.sqwah ?? 0,
                  })
                }
                className="apple-input w-full rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#1D1D1F] text-center"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#86868B] pl-1">งาน (0-3)</span>
              <input
                type="number"
                min="0"
                max="3"
                step="1"
                value={input.total_area?.ngan ?? 0}
                onChange={(e) =>
                  handleTotalAreaChange({
                    rai: input.total_area?.rai ?? 0,
                    ngan: Math.max(0, parseInt(e.target.value) || 0),
                    sqwah: input.total_area?.sqwah ?? 0,
                  })
                }
                className="apple-input w-full rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#1D1D1F] text-center"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#86868B] pl-1">ตารางวา</span>
              <input
                type="number"
                min="0"
                step="0.1"
                value={input.total_area?.sqwah ?? 0}
                onChange={(e) =>
                  handleTotalAreaChange({
                    rai: input.total_area?.rai ?? 0,
                    ngan: input.total_area?.ngan ?? 0,
                    sqwah: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="apple-input w-full rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#1D1D1F] text-center"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
              <Ruler className="w-4 h-4 text-amber-500" />
              <span>มิติรูปทรงแปลงที่ดิน (เมตร)</span>
            </label>
            <span className="text-xs font-mono font-medium text-[#48484A] bg-[#F5F5F7] px-2.5 py-1 rounded-full border border-black/[0.04]">
              {formatNumber(currentTotalSqm, 0)} ตร.ม. ({formatThaiArea(currentThaiUnits.rai, currentThaiUnits.ngan, currentThaiUnits.sqwah)})
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#86868B] pl-1">หน้ากว้างติดถนน (ม.)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={input.dimensions?.width_frontage_m ?? 32}
                onChange={(e) =>
                  handleDimensionsChange({
                    width_frontage_m: Math.max(0, parseFloat(e.target.value) || 0),
                    depth_m: input.dimensions?.depth_m ?? 50,
                  })
                }
                className="apple-input w-full rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#1D1D1F] text-center"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-medium text-[#86868B] pl-1">ความลึกของที่ดิน (ม.)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={input.dimensions?.depth_m ?? 50}
                onChange={(e) =>
                  handleDimensionsChange({
                    width_frontage_m: input.dimensions?.width_frontage_m ?? 32,
                    depth_m: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="apple-input w-full rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[#1D1D1F] text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Public Road Width */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>ความกว้างเขตทางถนนสาธารณะหน้าแปลง</span>
          </label>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200">
            {input.road_width_m.toFixed(1)} เมตร
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="number"
            min="2"
            max="60"
            step="0.5"
            value={input.road_width_m}
            onChange={(e) =>
              onChange({
                ...input,
                road_width_m: Math.max(0, parseFloat(e.target.value) || 0),
              })
            }
            className="apple-input sm:w-32 rounded-2xl px-3.5 py-2.5 text-sm font-bold text-[#1D1D1F] text-center"
          />

          {/* Tactile Pills for Presets */}
          <div className="flex-1 flex flex-wrap gap-2">
            {roadWidthPresets.map((preset) => {
              const isSelected = Math.abs(input.road_width_m - preset.width) < 0.1;
              return (
                <button
                  key={preset.width}
                  type="button"
                  onClick={() => onChange({ ...input, road_width_m: preset.width })}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all duration-200 select-none ${
                    isSelected
                      ? 'tactile-active-glow text-amber-950 font-semibold'
                      : 'tactile-button text-[#48484A]'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Sub-Zoning Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>ประเภทและบริเวณผังสี (กทม. 2556)</span>
          </label>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
              style={{ backgroundColor: selectedZone.color }}
            />
            <span className="font-bold text-[#1D1D1F]">{selectedZone.code}</span>
            <span className="text-[#86868B] font-mono text-[11px]">
              (FAR {selectedZone.far.toFixed(1)} / OSR {selectedZone.osr.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="relative">
          <select
            value={input.selected_zone_key}
            onChange={(e) => onChange({ ...input, selected_zone_key: e.target.value })}
            className="apple-input w-full rounded-2xl px-4 py-3 text-sm font-medium text-[#1D1D1F] bg-white cursor-pointer appearance-none shadow-2xs"
          >
            <optgroup label="ที่อยู่อาศัยหนาแน่นน้อย (ย.1 - ย.4)">
              {['Y1', 'Y2', 'Y3', 'Y4'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
            <optgroup label="ที่อยู่อาศัยหนาแน่นปานกลาง (ย.5 - ย.7)">
              {['Y5', 'Y6', 'Y7'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
            <optgroup label="ที่อยู่อาศัยหนาแน่นมาก (ย.8 - ย.10)">
              {['Y8', 'Y9', 'Y10'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
            <optgroup label="พาณิชยกรรม (พ.1 - พ.5)">
              {['P1', 'P2', 'P3', 'P4', 'P5'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
            <optgroup label="อุตสาหกรรม (อ.1 - อ.3)">
              {['A1', 'A2', 'A3'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
            <optgroup label="ชนบทและเกษตรกรรม (ก.1 - ก.5)">
              {['K1', 'K2', 'K4', 'K5'].map((k) => (
                <option key={k} value={k}>
                  {zones[k]?.code} - {zones[k]?.name_th} (FAR {zones[k]?.far} / OSR {zones[k]?.osr}%)
                </option>
              ))}
            </optgroup>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#86868B]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 4. Typology Cards with 3D Tactile & Warm Amber Glow */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-1.5">
          <Building className="w-4 h-4 text-amber-500" />
          <span>ประเภทอาคารเป้าหมาย (Building Typology)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(typologies).map((typ) => {
            const isSelected = input.selected_typology_id === typ.id;
            return (
              <button
                key={typ.id}
                type="button"
                onClick={() => onChange({ ...input, selected_typology_id: typ.id })}
                className={`rounded-2xl p-4 text-left transition-all duration-200 select-none relative overflow-hidden ${
                  isSelected
                    ? 'tactile-active-glow ring-2 ring-amber-400'
                    : 'tactile-button text-[#1D1D1F]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-xs font-semibold ${isSelected ? 'text-[#1D1D1F]' : 'text-[#2C2C2E]'}`}>
                    {typ.name_th}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[#86868B] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-mono text-amber-700 font-medium">ถนน ≥ {typ.min_road_width_m}ม.</span>
                  <span>•</span>
                  <span>ร่นข้าง {typ.setbacks.boundary_side_back_m}ม.</span>
                  <span>•</span>
                  <span>ที่ว่าง ≥ {typ.setbacks.min_open_space_ratio_bcr}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
