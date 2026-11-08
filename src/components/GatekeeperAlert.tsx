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
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-emerald-900">
            ผ่านเกณฑ์ความกว้างถนนขั้นต่ำตามกฎหมาย
          </h4>
          <p className="text-xs text-emerald-700 mt-0.5">
            ความกว้างเขตทางถนนสาธารณะ ({roadWidth.toFixed(1)} เมตร) ผ่านเกณฑ์ข้อกำหนดขั้นต่ำสำหรับประเภท{' '}
            <span className="font-semibold underline decoration-emerald-400">{typologyName}</span>
          </p>
        </div>
      </div>
    );
  }

  const isError = status === 'VIOLATION';

  return (
    <div
      className={`border rounded-xl p-4 shadow-sm transition-all ${
        isError ? 'bg-rose-50 border-rose-300' : 'bg-amber-50 border-amber-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4
              className={`text-sm font-bold ${
                isError ? 'text-rose-900' : 'text-amber-900'
              }`}
            >
              {isError
                ? 'ตรวจพบข้อห้ามทางกฎหมาย (Legal Road Width Violation)'
                : 'ข้อจำกัดทางกฎหมายเนื่องจากความกว้างถนน (Legal Restriction Warning)'}
            </h4>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isError
                  ? 'bg-rose-200 text-rose-800'
                  : 'bg-amber-200 text-amber-800'
              }`}
            >
              ถนน {roadWidth.toFixed(1)} ม.
            </span>
          </div>

          <div className="space-y-1.5">
            {violations.map((violation, index) => (
              <div
                key={index}
                className={`text-xs p-2.5 rounded-lg border ${
                  violation.severity === 'ERROR'
                    ? 'bg-rose-100/60 border-rose-200 text-rose-900'
                    : 'bg-amber-100/60 border-amber-200 text-amber-900'
                }`}
              >
                <div className="font-semibold">{violation.title}</div>
                <p className="mt-0.5 leading-relaxed">{violation.message}</p>
                <div className="mt-1 text-[11px] font-mono opacity-80">
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
