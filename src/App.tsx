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
import { Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const INITIAL_INPUT: UserInput = {
  input_mode: 'TOTAL_AREA',
  total_area: {
    rai: 1,
    ngan: 0,
    sqwah: 0,
  },
  dimensions: {
    width_frontage_m: 20,
    depth_m: 40,
  },
  road_width_m: 6.0,
  selected_zone_key: 'Y4',
  selected_typology_id: 'LOW_RISE_CONDO',
};

export const App: React.FC = () => {
  const [input, setInput] = useState<UserInput>(INITIAL_INPUT);

  const zones = useMemo(() => getAllZones(), []);
  const typologies = useMemo(() => getAllTypologies(), []);

  // Real-time Calculation
  const result = useMemo(() => {
    return calculateBuildingFeasibility(input);
  }, [input]);

  // Quick Preset Scenarios for Architect/Surveyor instant testing
  const presets = [
    {
      name: 'คอนโด Low-Rise ซอย 6ม. (ย.4)',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 1, ngan: 0, sqwah: 0 },
        road_width_m: 6.0,
        selected_zone_key: 'Y4',
        selected_typology_id: 'LOW_RISE_CONDO',
      },
    },
    {
      name: 'อาคารสูง CBD ถนน 18ม. (พ.5)',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 2, ngan: 2, sqwah: 0 },
        road_width_m: 18.0,
        selected_zone_key: 'P5',
        selected_typology_id: 'HIGH_RISE_EXTRA_LARGE',
      },
    },
    {
      name: 'ซอยแคบ 5ม. ลองขออาคารสูง (Trigger Error)',
      data: {
        input_mode: 'TOTAL_AREA' as const,
        total_area: { rai: 1, ngan: 0, sqwah: 0 },
        road_width_m: 5.0,
        selected_zone_key: 'Y9',
        selected_typology_id: 'HIGH_RISE_EXTRA_LARGE',
      },
    },
    {
      name: 'ที่ดินหน้าแคบ 12ม. (ติดระยะร่นตัด Footprint)',
      data: {
        input_mode: 'DIMENSIONS' as const,
        dimensions: { width_frontage_m: 12, depth_m: 35 },
        road_width_m: 6.0,
        selected_zone_key: 'Y4',
        selected_typology_id: 'LOW_RISE_CONDO',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>เคสตัวอย่างทดสอบไว:</span>
          </div>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInput({ ...input, ...preset.data })}
              className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition-all font-medium"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input Form & Gatekeeper Banner (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <InputForm
              input={input}
              onChange={setInput}
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
          <div className="lg:col-span-7 space-y-6">
            <ResultsDashboard result={result} />

            <LandVisualizer result={result} />

            <LegalCitationsDrawer citations={result.citations} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-medium text-slate-700">
            ระบบคำนวณและตรวจสอบกฎหมายอาคารและผังเมือง กรุงเทพมหานคร (BMA Building Regulations Engine)
          </p>
          <p>
            อ้างอิง: ข้อบัญญัติกรุงเทพมหานคร เรื่อง ควบคุมอาคาร พ.ศ. 2544 | กฎกระทรวงให้ใช้บังคับผังเมืองรวมกรุงเทพมหานคร พ.ศ. 2556
          </p>
          <p className="text-[11px] text-slate-400 pt-1">
            * ผลลัพธ์เป็นการประเมินเบื้องต้นเพื่อการศึกษาและทำ Feasibility ควรตรวจสอบสภาพแปลงที่ดินและระวางผังเมืองจริงกับสำนักงานเขตก่อนยื่นขออนุญาต
          </p>
        </div>
      </footer>
    </div>
  );
};
