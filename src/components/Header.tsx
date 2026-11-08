import React from 'react';
import { Building2, ShieldCheck, Scale, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/85 backdrop-blur-xl border-b border-black/[0.05] sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-[#1D1D1F]">
                BMA Zoning & Envelope Calculator
              </h1>
              <span className="bg-amber-100/70 text-amber-900 border border-amber-300/60 text-[11px] font-medium px-2 py-0.5 rounded-full shadow-2xs">
                กทม. 2556
              </span>
            </div>
            <p className="text-xs text-[#86868B] font-normal tracking-normal mt-0.5">
              เครื่องมือวิเคราะห์สิทธิการก่อสร้าง (FAR, OSR, BCR) ตามข้อบัญญัติ กทม. และกฎหมายผังเมือง
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1D1D1F] bg-white/80 px-3.5 py-1.5 rounded-full border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[#48484A]">ผังเมืองรวม กทม. ฉบับปัจจุบัน</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#1D1D1F] bg-white/80 px-3.5 py-1.5 rounded-full border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_1px_rgba(255,255,255,0.9)]">
            <Scale className="w-4 h-4 text-amber-600" />
            <span className="font-medium text-[#48484A]">BMA Bylaws 2544</span>
          </div>
        </div>
      </div>
    </header>
  );
};
