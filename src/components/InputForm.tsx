import React from 'react';
import { UserInput, ZoneConfig, TypologyConfig } from '../core/types';
import { formatNumber, raiNganWahToSqm } from '../core/unit-converter';
import { Layers, MapPin, Ruler, Building, Compass } from 'lucide-react';

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
      : (input.dimensions?.width_frontage_m || 0) * (input.dimensions?.depth_m || 0);

  const selectedZone = zones[input.selected_zone_key] || zones['Y4'];

  const roadWidthPresets = [
    { label: '4 ม. (ซอยแคบ)', width: 4.0 },
    { label: '6 ม. (เกณฑ์ Low-Rise)', width: 6.0 },
    { label: '8 ม.', width: 8.0 },
    { label: '10 ม. (เกณฑ์อาคารสูง)', width: 10.0 },
    { label: '12 ม.', width: 12.0 },
    { label: '18 ม. (ถนนสายหลัก)', width: 18.0 },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">กำหนดข้อมูลแปลงที่ดินและถนน</h2>
            <p className="text-xs text-slate-500">กรอกข้อมูลขนาดที่ดิน ความกว้างเขตทาง และประเภทอาคาร</p>
          </div>
        </div>

        {/* Input Mode Switcher */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onChange({ ...input, input_mode: 'TOTAL_AREA' })}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              input.input_mode === 'TOTAL_AREA'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ไร่-งาน-ตร.ว.
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...input, input_mode: 'DIMENSIONS' })}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              input.input_mode === 'DIMENSIONS'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            มิติ กว้าง x ลึก
          </button>
        </div>
      </div>

      {/* 1. Land Area Inputs */}
      {input.input_mode === 'TOTAL_AREA' ? (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-blue-500" />
            ขนาดพื้นที่ดิน (มาตราวัดไทย)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">ไร่</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={input.total_area?.rai ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...input,
                      total_area: {
                        ...input.total_area!,
                        rai: Math.max(0, parseInt(e.target.value) || 0),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">งาน (0-3)</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="3"
                  step="1"
                  value={input.total_area?.ngan ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...input,
                      total_area: {
                        ...input.total_area!,
                        ngan: Math.max(0, parseInt(e.target.value) || 0),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">ตารางวา</span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={input.total_area?.sqwah ?? 0}
                  onChange={(e) =>
                    onChange({
                      ...input,
                      total_area: {
                        ...input.total_area!,
                        sqwah: Math.max(0, parseFloat(e.target.value) || 0),
                      },
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg flex items-center justify-between border border-slate-100">
            <span>คำนวณเป็นหน่วยเมตริก:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatNumber(currentTotalSqm, 2)} ตร.ม. ({formatNumber(currentTotalSqm / 4, 1)} ตร.ว.)
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Ruler className="w-4 h-4 text-blue-500" />
            มิติรูปทรงแปลงที่ดิน (เมตร)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">
                หน้ากว้างติดถนน (ม.)
              </span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={input.dimensions?.width_frontage_m ?? 20}
                onChange={(e) =>
                  onChange({
                    ...input,
                    dimensions: {
                      ...input.dimensions!,
                      width_frontage_m: Math.max(0, parseFloat(e.target.value) || 0),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <span className="block text-[11px] font-medium text-slate-500 mb-1">
                ความลึกของที่ดิน (ม.)
              </span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={input.dimensions?.depth_m ?? 40}
                onChange={(e) =>
                  onChange({
                    ...input,
                    dimensions: {
                      ...input.dimensions!,
                      depth_m: Math.max(0, parseFloat(e.target.value) || 0),
                    },
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg flex items-center justify-between border border-slate-100">
            <span>คำนวณเป็นพื้นที่รวม:</span>
            <span className="font-semibold text-slate-800 font-mono">
              {formatNumber(currentTotalSqm, 2)} ตร.ม. ({formatNumber(currentTotalSqm / 4, 1)} ตร.ว.)
            </span>
          </div>
        </div>
      )}

      {/* 2. Road Width Input */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            ความกว้างเขตทางถนนสาธารณะหน้าแปลง (เมตร)
          </label>
          <span className="text-xs font-bold text-amber-600 font-mono">
            {input.road_width_m.toFixed(1)} ม.
          </span>
        </div>

        <div className="flex items-center gap-3">
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
            className="w-32 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <div className="flex-1 flex flex-wrap gap-1.5">
            {roadWidthPresets.map((preset) => (
              <button
                key={preset.width}
                type="button"
                onClick={() => onChange({ ...input, road_width_m: preset.width })}
                className={`text-[11px] font-medium px-2 py-1 rounded-lg border transition-all ${
                  Math.abs(input.road_width_m - preset.width) < 0.1
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Zoning Sub-code Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            ประเภทและบริเวณผังสี (ผังเมืองรวม กทม. 2556)
          </label>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-sm"
              style={{ backgroundColor: selectedZone.color }}
            />
            <span className="font-bold text-slate-800">{selectedZone.code}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">FAR {selectedZone.far.toFixed(1)}</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">OSR {selectedZone.osr.toFixed(1)}%</span>
          </div>
        </div>

        <select
          value={input.selected_zone_key}
          onChange={(e) => onChange({ ...input, selected_zone_key: e.target.value })}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent bg-white shadow-sm"
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
      </div>

      {/* 4. Building Typology Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Building className="w-4 h-4 text-indigo-500" />
          ประเภทอาคารเป้าหมาย (Building Typology)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(typologies).map((typ) => {
            const isSelected = input.selected_typology_id === typ.id;
            return (
              <button
                key={typ.id}
                type="button"
                onClick={() => onChange({ ...input, selected_typology_id: typ.id })}
                className={`p-3 text-left rounded-xl border transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {typ.name_th}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                    เกณฑ์ถนน ≥ {typ.min_road_width_m}ม.
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span>ร่นข้าง/หลัง {typ.setbacks.boundary_side_back_m}ม.</span>
                  <span>•</span>
                  <span>ที่ว่างขั้นต่ำ {typ.setbacks.min_open_space_ratio_bcr}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
