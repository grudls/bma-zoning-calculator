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
      <div className="apple-card px-5 py-4 border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 flex items-center gap-3 transition-all">
        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-xs text-[#1D1D1F] leading-relaxed">
          <span className="font-semibold text-emerald-800">✓ ถูกต้องตามกฎหมาย:</span>{' '}
          ความกว้างถนนสาธารณะ ({roadWidth.toFixed(1)} ม.) ผ่านเกณฑ์ขั้นต่ำสำหรับ{' '}
          <span className="font-semibold underline decoration-emerald-300 underline-offset-2">
            {typologyName}
          </span>
        </p>
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
      <div className="space-y-2.5">
        {violations.map((violation, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                violation.severity === 'ERROR'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {violation.severity === 'ERROR' ? (
                <XCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold ${
                    violation.severity === 'ERROR' ? 'text-rose-900' : 'text-amber-900'
                  }`}
                >
                  {violation.severity === 'ERROR' ? '✕ ขัดต่อข้อกำหนดกฎหมาย:' : '⚠ ข้อจำกัดทางกฎหมาย:'}{' '}
                  {violation.title}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    violation.severity === 'ERROR'
                      ? 'bg-rose-200/70 text-rose-900 border border-rose-300'
                      : 'bg-amber-200/70 text-amber-900 border border-amber-300'
                  }`}
                >
                  ถนน {roadWidth.toFixed(1)} ม. • {violation.legal_ref_id}
                </span>
              </div>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  violation.severity === 'ERROR' ? 'text-rose-950/90' : 'text-amber-950/90'
                }`}
              >
                {violation.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
