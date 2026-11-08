import React from 'react';
import { Building2, ShieldCheck, Scale } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              BMA Zoning & Envelope Calculator
              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">
                กทม. 2556 / 2544
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              เครื่องมือวิเคราะห์และคำนวณสิทธิการก่อสร้าง (FAR, OSR, BCR) ตามข้อบัญญัติ กทม. และกฎกระทรวงควบคุมอาคาร
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>อ้างอิงฐานข้อมูลผังเมืองรวม กทม. ฉบับปัจจุบัน</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <Scale className="w-4 h-4 text-slate-500" />
            <span>Legal Traceability Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
};
