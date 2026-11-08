import React, { useState } from 'react';
import { LegalCitation } from '../core/types';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldAlert } from 'lucide-react';

interface LegalCitationsDrawerProps {
  citations: LegalCitation[];
}

export const LegalCitationsDrawer: React.FC<LegalCitationsDrawerProps> = ({ citations }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-all border-b border-slate-200 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              บทบัญญัติและข้อกำหนดทางกฎหมายที่เกี่ยวข้อง (Legal References & Citations)
              <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                {citations.length} ข้อกฎหมาย
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              ข้อกฎหมายและมาตราที่ใช้เป็นฐานอ้างอิงในการคำนวณผลลัพธ์ข้างต้น
            </p>
          </div>
        </div>

        <div className="text-slate-500">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 divide-y divide-slate-100 space-y-3">
          {citations.map((cite) => (
            <div key={cite.id} className="pt-3 first:pt-0 space-y-1.5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>{cite.law_name}</span>
                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {cite.section}
                    </span>
                  </div>
                  {cite.authority && (
                    <div className="text-[11px] text-slate-400">
                      หน่วยงานผู้กำกับดูแล: {cite.authority}
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded">
                  {cite.id}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100 font-sans">
                {cite.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
