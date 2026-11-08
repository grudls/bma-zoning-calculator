import React from 'react';
import { AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { GatekeeperViolation } from '../core/types';

interface GatekeeperAlertProps {
  status: 'PASSED' | 'WARNING' | 'VIOLATION';
  violations: GatekeeperViolation[];
  roadWidth: number;
  typologyName: string;
}

export const GatekeeperAlert: React.FC<GatekeeperAlertProps> = ({
  status,
  violations,
  roadWidth,
  typologyName,
}) => {
  if (status === 'PASSED') {
    return (
      <div className="apple-card p-5 border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 flex items-start gap-3.5 transition-all">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-[#1D1D1F] tracking-tight">
            ผ่านเกณฑ์ความกว้างเขตทางตามกฎหมาย
          </h4>
          <p className="text-xs text-[#48484A] mt-0.5 leading-relaxed">
            ความกว้างถนนสาธารณะ ({roadWidth.toFixed(1)} เมตร) ผ่านเกณฑ์ขั้นต่ำตามข้อกำหนดสำหรับ{' '}
            <span className="font-semibold text-[#1D1D1F] underline decoration-emerald-300 underline-offset-2">
              {typologyName}
            </span>
          </p>
        </div>
      </div>
    );
  }

  const isError = status === 'VIOLATION';

  return (
    <div
      className={`apple-card p-5 transition-all border ${
        isError
          ? 'border-rose-200 bg-gradient-to-b from-white to-rose-50/40 ring-1 ring-rose-300/40'
          : 'border-amber-200 bg-gradient-to-b from-white to-amber-50/40 ring-1 ring-amber-300/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
            isError ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}
        >
          {isError ? (
            <XCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center justify-between">
            <h4
              className={`text-xs font-semibold tracking-tight ${
                isError ? 'text-rose-950' : 'text-amber-950'
              }`}
            >
              {isError
                ? 'ตรวจพบข้อห้ามทางกฎหมาย (Legal Road Width Violation)'
                : 'ข้อจำกัดทางกฎหมายเนื่องจากความกว้างถนน (Legal Restriction Warning)'}
            </h4>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isError
                  ? 'bg-rose-200/70 text-rose-900 border border-rose-300'
                  : 'bg-amber-200/70 text-amber-900 border border-amber-300'
              }`}
            >
              ถนน {roadWidth.toFixed(1)}ม.
            </span>
          </div>

          <div className="space-y-2">
            {violations.map((violation, index) => (
              <div
                key={index}
                className={`text-xs p-3 rounded-xl border leading-relaxed ${
                  violation.severity === 'ERROR'
                    ? 'bg-rose-50/80 border-rose-200/70 text-rose-950'
                    : 'bg-amber-50/80 border-amber-200/70 text-amber-950'
                }`}
              >
                <div className="font-semibold text-[11px] mb-0.5">{violation.title}</div>
                <p className="text-[11px] opacity-90">{violation.message}</p>
                <div className="mt-1 text-[10px] font-mono text-[#86868B]">
                  อ้างอิง: {violation.legal_ref_id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
