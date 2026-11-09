import React, { useState, useMemo } from 'react';
import { UserInput } from './core/types';
import {
  calculateBuildingFeasibility,
  getAllZones,
  getAllTypologies,
} from './core/calculator';

import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { GatekeeperAlert } from './components/GatekeeperAlert';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LandVisualizer } from './components/LandVisualizer';
import { LegalCitationsDrawer } from './components/LegalCitationsDrawer';
import { Sparkles } from 'lucide-react';

const INITIAL_INPUT: UserInput = {
  input_mode: 'TOTAL_AREA',
  total_area: {
    rai: 1,
    ngan: 0,
    sqwah: 0,
  },
  dimensions: {
    width_frontage_m: 32,
    depth_m: 50,
  },
  road_width_m: 6.0,
  selected_zone_key: 'Y4',
  selected_typology_id: 'LOW_RISE_CONDO',
};

export const App: React.FC = () => {
  const [input, setInput] = useState<UserInput>(INITIAL_INPUT);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);

  const zones = useMemo(() => getAllZones(), []);
  const typologies = useMemo(() => getAllTypologies(), []);

  // Real-time Calculation
  const result = useMemo(() => {
    return calculateBuildingFeasibility(input);
  }, [input]);

  // Quick Preset Scenarios for Architect/Surveyor instant testing
  const presets = [
    {
      id: 0,
      name: 'คอนโด Low-Rise ซอย 6ม. (ย.4)',
      badge: 'เคสยอดนิยม',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 1, ngan: 0, sqwah: 0 },
        dimensions: { width_frontage_m: 32, depth_m: 50 },
        road_width_m: 6.0,
        selected_zone_key: 'Y4',
        selected_typology_id: 'LOW_RISE_CONDO',
      },
    },
    {
      id: 1,
      name: 'อาคารสูง CBD ถนน 18ม. (พ.5)',
      badge: 'สุขุมวิท/สีลม',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 2, ngan: 2, sqwah: 0 },
        dimensions: { width_frontage_m: 50, depth_m: 80 },
        road_width_m: 18.0,
        selected_zone_key: 'P5',
        selected_typology_id: 'HIGH_RISE_EXTRA_LARGE',
      },
    },
    {
      id: 2,
      name: 'ซอยแคบ 5ม. ขออาคารสูง (Trigger Error)',
      badge: 'ทดสอบ Gatekeeper',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 1, ngan: 0, sqwah: 0 },
        dimensions: { width_frontage_m: 32, depth_m: 50 },
        road_width_m: 5.0,
        selected_zone_key: 'Y9',
        selected_typology_id: 'HIGH_RISE_EXTRA_LARGE',
      },
    },
    {
      id: 3,
      name: 'ที่ดินหน้าแคบ 12ม. (ติดระยะร่นตัด Footprint)',
      badge: 'ทดสอบ Envelope',
      data: {
        input_mode: 'DIMENSIONS' as const,
        total_area: { rai: 0, ngan: 1, sqwah: 5 },
        dimensions: { width_frontage_m: 12, depth_m: 35 },
        road_width_m: 6.0,
        selected_zone_key: 'Y4',
        selected_typology_id: 'LOW_RISE_CONDO',
      },
    },
  ];

  const handleSelectPreset = (preset: (typeof presets)[0]) => {
    setActivePresetIndex(preset.id);
    setInput({ ...input, ...preset.data });
  };

  const handleInputChange = (updated: UserInput) => {
    setActivePresetIndex(null);
    setInput(updated);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Apple Style Presets Bar with Tactile Buttons */}
        <div className="apple-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F]">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>เคสตัวอย่างจำลองผังเมือง:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {presets.map((preset) => {
              const isSelected = activePresetIndex === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-xs px-4 py-2 rounded-full font-medium transition-all duration-200 select-none flex items-center gap-1.5 ${
                    isSelected
                      ? 'tactile-active-glow ring-2 ring-amber-400 font-semibold text-amber-950'
                      : 'tactile-button text-[#48484A]'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-amber-200/80 text-amber-900'
                        : 'bg-black/[0.04] text-[#86868B]'
                    }`}
                  >
                    {preset.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid Layout (Apple Store Product Review Vibe) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Input Form & Gatekeeper Banner (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <InputForm
              input={input}
              onChange={handleInputChange}
              zones={zones}
              typologies={typologies}
            />

            <GatekeeperAlert
              status={result.gatekeeper.status}
              violations={result.gatekeeper.violations}
              roadWidth={result.envelope.road_width_m}
              typologyName={result.input_summary.typology_name}
            />
          </div>

          {/* Right Column: Dashboard & Schematics (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            <ResultsDashboard result={result} />

            <LandVisualizer result={result} />

            <LegalCitationsDrawer citations={result.citations} />
          </div>
        </div>
      </main>

      {/* Apple Minimalist Footer */}
      <footer className="bg-white/80 border-t border-black/[0.04] py-8 mt-12 text-center text-xs text-[#86868B]">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-[#1D1D1F]">
            ระบบคำนวณและตรวจสอบกฎหมายอาคารและผังเมือง กรุงเทพมหานคร (BMA Building Regulations Engine)
          </p>
          <p className="text-[11px]">
            อ้างอิง: ข้อบัญญัติกรุงเทพมหานคร เรื่อง ควบคุมอาคาร พ.ศ. 2544 | กฎกระทรวงให้ใช้บังคับผังเมืองรวมกรุงเทพมหานคร พ.ศ. 2556
          </p>
          <p className="text-[11px] text-[#A1A1A6] pt-1">
            * การคำนวณสิทธินี้เป็นการประเมินเบื้องต้นเพื่อการศึกษาและทำ Feasibility ผู้พัฒนาโครงการควรตรวจสอบสภาพระวางที่ดินจริงกับสำนักงานเขตก่อนยื่นขออนุญาตก่อสร้าง
          </p>
        </div>
      </footer>
    </div>
  );
};
