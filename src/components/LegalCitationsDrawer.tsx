import React, { useState } from 'react';
import { LegalCitation } from '../core/types';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface LegalCitationsDrawerProps {
  citations: LegalCitation[];
}

export const LegalCitationsDrawer: React.FC<LegalCitationsDrawerProps> = ({ citations }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="apple-card overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4.5 flex items-center justify-between bg-white hover:bg-[#FAFAFA] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04]">
            <BookOpen className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              บทบัญญัติและข้อกำหนดทางกฎหมายที่เกี่ยวข้อง
              <span className="bg-amber-100/70 text-amber-900 border border-amber-300/60 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                {citations.length} มาตรา
              </span>
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              ข้อกฎหมายและมาตราที่ใช้เป็นฐานอ้างอิงในการคำนวณผลลัพธ์ข้างต้น
            </p>
          </div>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] transition-all">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 divide-y divide-black/[0.03] space-y-4">
          {citations.map((cite) => (
            <div key={cite.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[#1D1D1F] flex items-center gap-2">
                    <span>{cite.law_name}</span>
                    <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                      {cite.section}
                    </span>
                  </div>
                  {cite.authority && (
                    <div className="text-[11px] text-[#86868B]">
                      หน่วยงานผู้กำกับดูแล: {cite.authority}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-[#86868B] shrink-0 bg-[#F5F5F7] px-2 py-0.5 rounded-md border border-black/[0.04]">
                  {cite.id}
                </span>
              </div>

              <p className="text-xs text-[#48484A] leading-relaxed bg-[#F8F9FA] p-3.5 rounded-2xl border border-black/[0.03]">
                {cite.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
