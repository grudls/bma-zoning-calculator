import React, { useState } from 'react';
import { CalculationResult } from '../core/types';
import { formatNumber } from '../core/unit-converter';
import { Box, Layers } from 'lucide-react';

interface LandVisualizerProps {
  result: CalculationResult;
}

type ViewMode = '2D' | '3D';

const COS30 = Math.cos(Math.PI / 6); // ~0.8660254
const SIN30 = 0.5;

export const LandVisualizer: React.FC<LandVisualizerProps> = ({ result }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('3D');

  const { envelope, input_summary, theoretical, gatekeeper } = result;

  const roadWidth = Math.max(2, envelope.road_width_m || 6);
  const frontSetback = envelope.road_setback_from_boundary_m;
  const sideSetback = envelope.boundary_side_back_setback_m;

  // Real synchronized parcel dimensions
  const landW = Math.max(6, input_summary.width_frontage_m || 32);
  const landD = Math.max(6, input_summary.depth_m || 50);

  // Buildable footprint dimensions
  const buildW = Math.max(0, envelope.buildable_width_m ?? Math.max(0, landW - 2 * sideSetback));
  const buildD = Math.max(
    0,
    envelope.buildable_depth_m ?? Math.max(0, landD - (frontSetback + sideSetback))
  );

  // Determine parametric building massing dimensions (W x D x H) & floors based on typology
  const typologyId = input_summary.typology_id || 'LOW_RISE_CONDO';
  const legalMaxHeight = envelope.max_building_height_at_front_m;
  const isViolation = gatekeeper.status === 'VIOLATION';

  let massW = buildW;
  let massD = buildD;
  let massH = legalMaxHeight;
  let floorHeight = 3.2;
  let floorsCount = Math.max(1, envelope.estimated_max_floors);
  let typologyLabel = 'อาคารพักอาศัยรวม / คอนโด';

  if (typologyId === 'SINGLE_FAMILY_HOUSE') {
    typologyLabel = 'บ้านพักอาศัยเดี่ยว (2–3 ชั้น)';
    floorHeight = 3.2;
    // Compact residential house massing (~2-3 stories, ~9-10m max)
    massH = Math.min(legalMaxHeight, 9.6);
    floorsCount = Math.max(1, Math.round(massH / floorHeight));
    massW = Math.round(Math.min(buildW, Math.max(7, buildW * 0.72)) * 10) / 10;
    massD = Math.round(Math.min(buildD, Math.max(8, buildD * 0.68)) * 10) / 10;
  } else if (typologyId === 'OFFICE_BUILDING') {
    typologyLabel = 'อาคารพาณิชย์ / สำนักงานโมดูลาร์';
    floorHeight = 3.6;
    // Modular commercial/office block (~3.5-4 floors ~12-15m or scaled by FAR/road)
    const idealFloors =
      massW * massD > 0
        ? Math.ceil(theoretical.max_gross_floor_area_sqm / (massW * massD))
        : 4;
    const targetHeight = Math.max(14.4, Math.min(legalMaxHeight, idealFloors * floorHeight));
    massH = Math.round(Math.min(legalMaxHeight, targetHeight) * 10) / 10;
    floorsCount = Math.max(1, Math.floor(massH / floorHeight));
  } else if (typologyId === 'LOW_RISE_CONDO') {
    typologyLabel = 'คอนโดมิเนียม Low-Rise (≤ 23 ม.)';
    floorHeight = 3.0;
    // Low-rise capped at 23m by building control act
    massH = Math.round(Math.min(23.0, legalMaxHeight) * 10) / 10;
    floorsCount = Math.max(1, Math.floor(massH / floorHeight));
  } else if (typologyId === 'HIGH_RISE_EXTRA_LARGE') {
    typologyLabel = 'อาคารสูง / ทาวเวอร์ขนาดใหญ่พิเศษ';
    floorHeight = 3.2;
    // High-rise tower uses full road-permitted height (or FAR-derived height)
    massH = Math.round(legalMaxHeight * 10) / 10;
    floorsCount = Math.max(1, Math.floor(massH / floorHeight));
  }

  // Clamp visual proportions for isometric scene so ultra-long or tiny plots remain readable
  const visScaleRatio = 1;
  const vLandW = Math.min(80, Math.max(14, landW * visScaleRatio));
  const vLandD = Math.min(90, Math.max(18, landD * visScaleRatio));
  const scaleX = vLandW / landW;
  const scaleY = vLandD / landD;

  const vRoadW = Math.min(28, Math.max(6, roadWidth * ((scaleX + scaleY) / 2)));
  const vSideSetback = Math.max(1.5, sideSetback * scaleX);
  const vRearSetback = Math.max(1.5, sideSetback * scaleY);
  const vFrontSetback = Math.max(frontSetback > 0 ? 2.0 : 0.8, frontSetback * scaleY);

  const vBuildW = Math.max(0, vLandW - 2 * vSideSetback);
  const vBuildD = Math.max(0, vLandD - (vFrontSetback + vRearSetback));

  const vMassW =
    buildW > 0 ? Math.max(3, vBuildW * (massW / buildW)) : 0;
  const vMassD =
    buildD > 0 ? Math.max(3, vBuildD * (massD / buildD)) : 0;
  const vMassH =
    vMassW > 0 && vMassD > 0
      ? Math.min(75, Math.max(6, massH * ((scaleX + scaleY) / 2) * 1.15))
      : 0;

  // Center massing inside buildable zone
  const massX1 = vSideSetback + (vBuildW - vMassW) / 2;
  const massX2 = massX1 + vMassW;
  const massY1 = vFrontSetback + (vBuildD - vMassD) / 2;
  const massY2 = massY1 + vMassD;

  // Raw isometric projection helper
  const rawIso = (x: number, y: number, z: number) => ({
    u: (x - y) * COS30,
    v: -(x + y) * SIN30 - z,
  });

  // Compute bounding box in raw isometric space for auto-fitting into 560x360 SVG
  const samplePoints = [
    rawIso(0, -vRoadW, -2),
    rawIso(vLandW, -vRoadW, -2),
    rawIso(0, vLandD, 0),
    rawIso(vLandW, vLandD, 0),
    rawIso(0, 0, vMassH + 8),
    rawIso(vLandW, 0, vMassH + 8),
    rawIso(vLandW, vLandD, vMassH + 8),
    rawIso(0, vLandD, vMassH + 8),
  ];

  const minU = Math.min(...samplePoints.map((p) => p.u));
  const maxU = Math.max(...samplePoints.map((p) => p.u));
  const minV = Math.min(...samplePoints.map((p) => p.v));
  const maxV = Math.max(...samplePoints.map((p) => p.v));

  const svgW = 580;
  const svgH = 360;
  const padX = 78;
  const padY = 44;

  const isoScale = Math.min(
    (svgW - padX * 2) / Math.max(1, maxU - minU),
    (svgH - padY * 2) / Math.max(1, maxV - minV)
  );

  const centerU = (minU + maxU) / 2;
  const centerV = (minV + maxV) / 2;

  const iso = (x: number, y: number, z: number = 0) => {
    const r = rawIso(x, y, z);
    return {
      x: svgW / 2 + (r.u - centerU) * isoScale,
      y: svgH / 2 + (r.v - centerV) * isoScale,
    };
  };

  const polyPoints = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Helper to render a 3D isometric box [x1,x2] x [y1,y2] x [z1,z2]
  const renderIsoBox = (
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    z1: number,
    z2: number,
    colors: {
      top: string;
      frontRight: string;
      frontLeft: string;
      stroke: string;
      strokeWidth?: number;
      opacity?: number;
    }
  ) => {
    const pTop = [
      iso(x1, y1, z2),
      iso(x2, y1, z2),
      iso(x2, y2, z2),
      iso(x1, y2, z2),
    ];
    const pFrontRight = [
      iso(x1, y1, z1),
      iso(x2, y1, z1),
      iso(x2, y1, z2),
      iso(x1, y1, z2),
    ];
    const pFrontLeft = [
      iso(x1, y2, z1),
      iso(x1, y1, z1),
      iso(x1, y1, z2),
      iso(x1, y2, z2),
    ];

    const sw = colors.strokeWidth ?? 1.2;
    const op = colors.opacity ?? 1;

    return (
      <g opacity={op}>
        <polygon
          points={polyPoints(pFrontLeft)}
          fill={colors.frontLeft}
          stroke={colors.stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <polygon
          points={polyPoints(pFrontRight)}
          fill={colors.frontRight}
          stroke={colors.stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
        <polygon
          points={polyPoints(pTop)}
          fill={colors.top}
          stroke={colors.stroke}
          strokeWidth={sw}
          strokeLinejoin="round"
        />
      </g>
    );
  };

  // Generate grid lines on the land parcel
  const gridLines: React.ReactNode[] = [];
  const stepCount = 5;
  for (let i = 1; i < stepCount; i++) {
    const gx = (vLandW / stepCount) * i;
    const p1 = iso(gx, 0, 0);
    const p2 = iso(gx, vLandD, 0);
    gridLines.push(
      <line
        key={`gx-${i}`}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke="#CBD5E1"
        strokeWidth="0.7"
        strokeOpacity="0.6"
      />
    );

    const gy = (vLandD / stepCount) * i;
    const q1 = iso(0, gy, 0);
    const q2 = iso(vLandW, gy, 0);
    gridLines.push(
      <line
        key={`gy-${i}`}
        x1={q1.x}
        y1={q1.y}
        x2={q2.x}
        y2={q2.y}
        stroke="#CBD5E1"
        strokeWidth="0.7"
        strokeOpacity="0.6"
      />
    );
  }

  return (
    <div className="apple-card p-6 space-y-5 transition-all">
      {/* Header Bar with [ 2D Plan | 3D Isometric ] Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.04] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center border border-black/[0.04] shadow-2xs">
            {viewMode === '3D' ? (
              <Box className="w-4 h-4 text-amber-500" />
            ) : (
              <Layers className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#1D1D1F] flex items-center gap-2">
              <span>
                {viewMode === '3D'
                  ? 'แบบจำลองมวลอาคาร 3 มิติ (Isometric 3D Massing)'
                  : 'แผนภาพจำลองระนาบระยะร่นและเขตทาง (2D Envelope Plan)'}
              </span>
            </h3>
            <p className="text-xs text-[#86868B] mt-0.5">
              {typologyLabel} • แปลงที่ดิน {formatNumber(landW, 1)} × {formatNumber(landD, 1)} ม. ({formatNumber(input_summary.land_area_sqm, 0)} ตร.ม.)
            </p>
          </div>
        </div>

        {/* View Mode Switcher: [ 2D Plan | 3D Isometric ] */}
        <div className="tactile-track rounded-full p-1 inline-flex items-center self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('2D')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none flex items-center gap-1.5 ${
              viewMode === '2D'
                ? 'tactile-active-glow text-amber-950 font-semibold ring-1 ring-amber-400'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Plan</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3D')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none flex items-center gap-1.5 ${
              viewMode === '3D'
                ? 'tactile-active-glow text-amber-950 font-semibold ring-1 ring-amber-400'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D Isometric</span>
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="bg-[#F8F9FA] rounded-2xl p-4 sm:p-6 border border-black/[0.05] relative overflow-hidden flex flex-col items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.02)]">
        {/* Top Floating KPI Badges inside Visualizer */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-2 z-10">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-[#48484A] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
              ที่ดิน: <strong className="text-[#1D1D1F] font-mono">{formatNumber(input_summary.land_area_sqm, 0)} ตร.ม.</strong>
            </span>
            <span className="text-[11px] font-medium text-[#48484A] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
              GFA สูงสุด: <strong className="text-amber-700 font-mono">{formatNumber(theoretical.max_gross_floor_area_sqm, 0)} ตร.ม.</strong>
            </span>
            <span className="text-[11px] font-medium text-[#48484A] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
              Footprint: <strong className="text-[#1D1D1F] font-mono">{formatNumber(massW, 1)}×{formatNumber(massD, 1)} ม.</strong>
            </span>
          </div>

          <div className="text-[11px] font-mono font-semibold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-300/80 shadow-2xs">
            H = {massH.toFixed(1)} ม. (~{floorsCount} ชั้น) | เพดานกฎหมาย ≤ {legalMaxHeight.toFixed(1)} ม.
          </div>
        </div>

        {viewMode === '3D' ? (
          /* ==================== 3D ISOMETRIC VIEW ==================== */
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full max-w-2xl h-auto select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="iso-bg-dots" width="18" height="18" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="#CBD5E1" fillOpacity="0.55" />
              </pattern>
              <filter id="iso-shadow" x="-15%" y="-15%" width="130%" height="130%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0F172A" floodOpacity="0.10" />
              </filter>
              <marker
                id="dim-arrow-start"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 10 0 L 0 5 L 10 10 z" fill="#D97706" />
              </marker>
              <marker
                id="dim-arrow-end"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97706" />
              </marker>
            </defs>

            <rect width={svgW} height={svgH} fill="#F8F9FA" />
            <rect width={svgW} height={svgH} fill="url(#iso-bg-dots)" />

            {/* 1. Land Parcel 3D Base Slab & Setback Zone (Red Translucent Surface) */}
            <g filter="url(#iso-shadow)">
              {renderIsoBox(0, vLandW, 0, vLandD, -1.6, 0, {
                top: '#FFE4E6', // Soft red setback zone across plot perimeter
                frontRight: '#CBD5E1',
                frontLeft: '#94A3B8',
                stroke: '#F43F5E',
                strokeWidth: 1.2,
              })}
            </g>

            {/* Isometric Grid on Land Parcel */}
            {gridLines}

            {/* Outer Property Boundary Dashed Frame */}
            <polygon
              points={polyPoints([
                iso(0, 0, 0.05),
                iso(vLandW, 0, 0.05),
                iso(vLandW, vLandD, 0.05),
                iso(0, vLandD, 0.05),
              ])}
              fill="none"
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />

            {/* 2. Front Public Road Slab (y in [-vRoadW, 0]) */}
            {renderIsoBox(0, vLandW, -vRoadW, 0, -1.6, -0.1, {
              top: '#E2E8F0',
              frontRight: '#94A3B8',
              frontLeft: '#64748B',
              stroke: '#94A3B8',
              strokeWidth: 1,
            })}

            {/* Public Road Centerline (30° Isometric Line) */}
            {(() => {
              const rc1 = iso(0, -vRoadW / 2, 0);
              const rc2 = iso(vLandW, -vRoadW / 2, 0);
              const rcMid = iso(vLandW / 2, -vRoadW / 2, 0);
              return (
                <g>
                  <line
                    x1={rc1.x}
                    y1={rc1.y}
                    x2={rc2.x}
                    y2={rc2.y}
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="7 5"
                  />
                  <rect
                    x={rcMid.x - 58}
                    y={rcMid.y + 6}
                    width="116"
                    height="18"
                    rx="9"
                    fill="#FFFFFF"
                    fillOpacity="0.92"
                    stroke="#F59E0B"
                    strokeWidth="1"
                  />
                  <text
                    x={rcMid.x}
                    y={rcMid.y + 18}
                    fill="#92400E"
                    fontSize="9.5"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    ถนนสาธารณะ {roadWidth.toFixed(1)} ม.
                  </text>
                </g>
              );
            })()}

            {/* 3. Inner Buildable Footprint Pad on Ground */}
            {vBuildW > 0 && vBuildD > 0 && (
              <polygon
                points={polyPoints([
                  iso(vSideSetback, vFrontSetback, 0.1),
                  iso(vLandW - vSideSetback, vFrontSetback, 0.1),
                  iso(vLandW - vSideSetback, vLandD - vRearSetback, 0.1),
                  iso(vSideSetback, vLandD - vRearSetback, 0.1),
                ])}
                fill="#FEF3C7"
                fillOpacity="0.85"
                stroke="#F59E0B"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
            )}

            {/* 4. Parametric 3D Building Massing by Typology */}
            {vMassW > 0 && vMassD > 0 && vMassH > 0 ? (
              <g>
                {typologyId === 'SINGLE_FAMILY_HOUSE' && (
                  /* --- Typology A: Single Family House (Compact 2-3 Floor Ivory Massing) --- */
                  <g>
                    {/* Main 2-story body */}
                    {renderIsoBox(
                      massX1,
                      massX2,
                      massY1,
                      massY2,
                      0.1,
                      vMassH * 0.68,
                      {
                        top: '#FFFFFF',
                        frontRight: '#FFFBEB',
                        frontLeft: '#F1F5F9',
                        stroke: '#64748B',
                        strokeWidth: 1.3,
                      }
                    )}
                    {/* Upper 3rd-story stepped architectural volume */}
                    {renderIsoBox(
                      massX1 + vMassW * 0.12,
                      massX2 - vMassW * 0.08,
                      massY1 + vMassD * 0.1,
                      massY2 - vMassD * 0.12,
                      vMassH * 0.68,
                      vMassH,
                      {
                        top: '#FEF3C7',
                        frontRight: '#FFFFFF',
                        frontLeft: '#E2E8F0',
                        stroke: '#64748B',
                        strokeWidth: 1.2,
                      }
                    )}
                    {/* Floor slab lines for house */}
                    {[1, 2].map((fl) => {
                      const zFl = (vMassH / 3) * fl;
                      if (zFl >= vMassH * 0.67) return null;
                      const pL = iso(massX1, massY2, zFl);
                      const pC = iso(massX1, massY1, zFl);
                      const pR = iso(massX2, massY1, zFl);
                      return (
                        <polyline
                          key={`h-fl-${fl}`}
                          points={polyPoints([pL, pC, pR])}
                          fill="none"
                          stroke="#94A3B8"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </g>
                )}

                {typologyId === 'OFFICE_BUILDING' && (
                  /* --- Typology B: Commercial / Shophouse / Office (Modular Bays & Floor Slabs) --- */
                  <g>
                    {renderIsoBox(massX1, massX2, massY1, massY2, 0.1, vMassH, {
                      top: '#FEF3C7',
                      frontRight: '#FFFBEB',
                      frontLeft: '#FDE68A',
                      stroke: '#D97706',
                      strokeWidth: 1.4,
                    })}

                    {/* Horizontal Floor Plates */}
                    {Array.from({ length: Math.min(25, Math.max(1, floorsCount - 1)) }).map(
                      (_, idx) => {
                        const zFl = ((idx + 1) / floorsCount) * vMassH;
                        const pL = iso(massX1, massY2, zFl);
                        const pC = iso(massX1, massY1, zFl);
                        const pR = iso(massX2, massY1, zFl);
                        return (
                          <polyline
                            key={`off-fl-${idx}`}
                            points={polyPoints([pL, pC, pR])}
                            fill="none"
                            stroke="#D97706"
                            strokeWidth="0.9"
                            strokeOpacity="0.7"
                          />
                        );
                      }
                    )}

                    {/* Vertical Modular Shophouse/Office Bays along Frontage */}
                    {Array.from({ length: 3 }).map((_, idx) => {
                      const bx = massX1 + ((idx + 1) / 4) * vMassW;
                      const bBot = iso(bx, massY1, 0.1);
                      const bTop = iso(bx, massY1, vMassH);
                      const bBack = iso(bx, massY2, vMassH);
                      return (
                        <polyline
                          key={`bay-${idx}`}
                          points={polyPoints([bBot, bTop, bBack])}
                          fill="none"
                          stroke="#B45309"
                          strokeWidth="0.8"
                          strokeOpacity="0.45"
                        />
                      );
                    })}
                  </g>
                )}

                {(typologyId === 'LOW_RISE_CONDO' || typologyId === 'HIGH_RISE_EXTRA_LARGE') && (
                  /* --- Typology C & D: Low-Rise Condo / High-Rise Tower with Clear Floor Plates --- */
                  <g>
                    {/* If High-Rise, render a 3-story Podium + Setback Tower */}
                    {typologyId === 'HIGH_RISE_EXTRA_LARGE' && floorsCount > 6 ? (
                      <>
                        {/* Podium Base (First 3 Floors) */}
                        {renderIsoBox(
                          massX1,
                          massX2,
                          massY1,
                          massY2,
                          0.1,
                          vMassH * 0.22,
                          {
                            top: isViolation ? '#FECDD3' : '#FDE68A',
                            frontRight: isViolation ? '#FFE4E6' : '#FFFBEB',
                            frontLeft: isViolation ? '#FDA4AF' : '#FCD34D',
                            stroke: isViolation ? '#E11D48' : '#D97706',
                            strokeWidth: 1.3,
                          }
                        )}
                        {/* High-Rise Tower Shaft */}
                        {renderIsoBox(
                          massX1 + vMassW * 0.12,
                          massX2 - vMassW * 0.12,
                          massY1 + vMassD * 0.1,
                          massY2 - vMassD * 0.1,
                          vMassH * 0.22,
                          vMassH,
                          {
                            top: isViolation ? '#FFE4E6' : '#FEF3C7',
                            frontRight: isViolation ? '#FFF1F2' : '#FFFBEB',
                            frontLeft: isViolation ? '#FECDD3' : '#FDE68A',
                            stroke: isViolation ? '#E11D48' : '#D97706',
                            strokeWidth: 1.5,
                          }
                        )}
                        {/* Tower Floor Plates */}
                        {Array.from({
                          length: Math.min(30, Math.max(2, floorsCount - 1)),
                        }).map((_, idx) => {
                          const ratio = (idx + 1) / floorsCount;
                          const zFl = ratio * vMassH;
                          const isPodium = ratio <= 0.22;
                          const tx1 = isPodium ? massX1 : massX1 + vMassW * 0.12;
                          const tx2 = isPodium ? massX2 : massX2 - vMassW * 0.12;
                          const ty1 = isPodium ? massY1 : massY1 + vMassD * 0.1;
                          const ty2 = isPodium ? massY2 : massY2 - vMassD * 0.1;
                          return (
                            <polyline
                              key={`hr-fl-${idx}`}
                              points={polyPoints([
                                iso(tx1, ty2, zFl),
                                iso(tx1, ty1, zFl),
                                iso(tx2, ty1, zFl),
                              ])}
                              fill="none"
                              stroke={isViolation ? '#E11D48' : '#D97706'}
                              strokeWidth="0.85"
                              strokeOpacity="0.65"
                            />
                          );
                        })}
                        {/* Rooftop Crown / Core */}
                        {renderIsoBox(
                          massX1 + vMassW * 0.32,
                          massX2 - vMassW * 0.32,
                          massY1 + vMassD * 0.32,
                          massY2 - vMassD * 0.32,
                          vMassH,
                          vMassH + 2.5,
                          {
                            top: '#FFFFFF',
                            frontRight: '#F8FAFC',
                            frontLeft: '#E2E8F0',
                            stroke: isViolation ? '#E11D48' : '#B45309',
                            strokeWidth: 1,
                          }
                        )}
                      </>
                    ) : (
                      /* Low-Rise Condo Slab with Floor Plates */
                      <>
                        {renderIsoBox(massX1, massX2, massY1, massY2, 0.1, vMassH, {
                          top: '#FEF3C7',
                          frontRight: '#FFFBEB',
                          frontLeft: '#FDE68A',
                          stroke: '#D97706',
                          strokeWidth: 1.5,
                        })}
                        {Array.from({
                          length: Math.min(20, Math.max(1, floorsCount - 1)),
                        }).map((_, idx) => {
                          const zFl = ((idx + 1) / floorsCount) * vMassH;
                          return (
                            <polyline
                              key={`lr-fl-${idx}`}
                              points={polyPoints([
                                iso(massX1, massY2, zFl),
                                iso(massX1, massY1, zFl),
                                iso(massX2, massY1, zFl),
                              ])}
                              fill="none"
                              stroke="#D97706"
                              strokeWidth="0.95"
                              strokeOpacity="0.7"
                            />
                          );
                        })}
                        {/* Rooftop Elevator Core */}
                        {renderIsoBox(
                          massX1 + vMassW * 0.35,
                          massX2 - vMassW * 0.35,
                          massY1 + vMassD * 0.35,
                          massY2 - vMassD * 0.35,
                          vMassH,
                          vMassH + 2.0,
                          {
                            top: '#FFFFFF',
                            frontRight: '#F8FAFC',
                            frontLeft: '#E2E8F0',
                            stroke: '#B45309',
                            strokeWidth: 1,
                          }
                        )}
                      </>
                    )}
                  </g>
                )}

                {/* 5. Vertical Height Dimension Line (H) on the Right Side of the Building */}
                {(() => {
                  const baseRight = iso(massX2, massY1, 0.1);
                  const topRight = iso(massX2, massY1, vMassH);
                  const dimX = baseRight.x + 26;
                  const midY = (baseRight.y + topRight.y) / 2;

                  return (
                    <g>
                      {/* Extension ticks */}
                      <line
                        x1={baseRight.x + 3}
                        y1={baseRight.y}
                        x2={dimX + 5}
                        y2={baseRight.y}
                        stroke="#D97706"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      <line
                        x1={topRight.x + 3}
                        y1={topRight.y}
                        x2={dimX + 5}
                        y2={topRight.y}
                        stroke="#D97706"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Vertical Dimension Line with Arrows */}
                      <line
                        x1={dimX}
                        y1={baseRight.y}
                        x2={dimX}
                        y2={topRight.y}
                        stroke="#D97706"
                        strokeWidth="1.6"
                        markerStart="url(#dim-arrow-start)"
                        markerEnd="url(#dim-arrow-end)"
                      />
                      {/* Height Label Badge */}
                      <rect
                        x={dimX + 8}
                        y={midY - 18}
                        width="88"
                        height="34"
                        rx="8"
                        fill="#FFFFFF"
                        stroke="#F59E0B"
                        strokeWidth="1.2"
                      />
                      <text
                        x={dimX + 52}
                        y={midY - 3}
                        fill="#78350F"
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        H = {massH.toFixed(1)} ม.
                      </text>
                      <text
                        x={dimX + 52}
                        y={midY + 10}
                        fill="#B45309"
                        fontSize="8.5"
                        fontWeight="600"
                        textAnchor="middle"
                      >
                        ({floorsCount} ชั้น • ชั้นละ {floorHeight}ม.)
                      </text>
                    </g>
                  );
                })()}
              </g>
            ) : (
              /* Fallback if setbacks exceed plot dimensions */
              (() => {
                const c = iso(vLandW / 2, vLandD / 2, 4);
                return (
                  <text
                    x={c.x}
                    y={c.y}
                    fill="#E11D48"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    มิติที่ดินแคบเกินระยะร่นตามกฎหมาย (ไม่สามารถขึ้นก้อนอาคารได้)
                  </text>
                );
              })()
            )}

            {/* 6. Ground Dimension Labels (Width W & Depth D & Setbacks) */}
            {(() => {
              const pLeftMid = iso(0, vLandD / 2, 0);
              const pBackMid = iso(vLandW / 2, vLandD, 0);
              return (
                <g>
                  {/* Depth Label on Left Edge */}
                  <rect
                    x={pLeftMid.x - 76}
                    y={pLeftMid.y - 12}
                    width="70"
                    height="20"
                    rx="6"
                    fill="#FFFFFF"
                    fillOpacity="0.9"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                  <text
                    x={pLeftMid.x - 41}
                    y={pLeftMid.y + 2}
                    fill="#334155"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    ลึก {formatNumber(landD, 1)} ม.
                  </text>

                  {/* Width Label on Back-Right Edge */}
                  <rect
                    x={pBackMid.x - 38}
                    y={pBackMid.y - 24}
                    width="76"
                    height="20"
                    rx="6"
                    fill="#FFFFFF"
                    fillOpacity="0.9"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                  <text
                    x={pBackMid.x}
                    y={pBackMid.y - 11}
                    fill="#334155"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    กว้าง {formatNumber(landW, 1)} ม.
                  </text>
                </g>
              );
            })()}
          </svg>
        ) : (
          /* ==================== 2D PLAN VIEW ==================== */
          <svg
            viewBox="0 0 500 280"
            className="w-full max-w-lg h-auto select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="light-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.8" />
              </pattern>
              <filter id="soft-shadow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.08" />
              </filter>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#D97706" />
              </marker>
            </defs>

            <rect width="500" height="280" fill="#F8F9FA" />
            <rect width="500" height="280" fill="url(#light-grid)" />

            {/* 1. Public Road Zone (Bottom) */}
            <rect
              x="30"
              y="210"
              width="440"
              height="55"
              fill="#E2E8F0"
              rx="8"
              stroke="#CBD5E1"
              strokeWidth="1"
            />

            {/* Road Centerline */}
            <line
              x1="30"
              y1="237"
              x2="470"
              y2="237"
              stroke="#D97706"
              strokeWidth="2"
              strokeDasharray="8 6"
            />
            <text
              x="250"
              y="233"
              fill="#B45309"
              fontSize="9"
              textAnchor="middle"
              fontWeight="600"
              letterSpacing="0.5"
            >
              กึ่งกลางถนนสาธารณะ (ROAD CENTERLINE)
            </text>
            <text x="250" y="254" fill="#64748B" fontSize="11" textAnchor="middle" fontWeight="500">
              ถนนสาธารณะกว้าง {roadWidth.toFixed(1)} เมตร
            </text>

            {/* 2. Property Boundary (Land Parcel with Red Setback Zone) */}
            <rect
              x="70"
              y="30"
              width="360"
              height="180"
              fill="#FFE4E6"
              fillOpacity="0.55"
              stroke="#E11D48"
              strokeWidth="1.5"
              strokeDasharray="5 4"
              rx="8"
              filter="url(#soft-shadow)"
            />
            <text x="82" y="46" fill="#BE123C" fontSize="9.5" fontWeight="600">
              แนวเขตที่ดิน {formatNumber(landW, 1)} × {formatNumber(landD, 1)} ม. (พื้นที่ระยะร่นรอบแปลง)
            </text>

            {/* 3. Front Road Setback Line */}
            {frontSetback > 0 ? (
              <>
                <line
                  x1="70"
                  y1={210 - Math.min(60, frontSetback * 15)}
                  x2="430"
                  y2={210 - Math.min(60, frontSetback * 15)}
                  stroke="#F43F5E"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <text
                  x="250"
                  y={210 - Math.min(60, frontSetback * 15) / 2 + 3}
                  fill="#BE123C"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  ร่นจากแนวเขตที่ดินด้านหน้า {frontSetback.toFixed(2)} ม. (ข้อ 54)
                </text>
              </>
            ) : (
              <text x="250" y="200" fill="#059669" fontSize="10" textAnchor="middle" fontWeight="500">
                ไม่ต้องร่นจากแนวเขตที่ดินด้านหน้า (ร่นจากกึ่งกลางถนนพ้นเขตทางแล้ว)
              </text>
            )}

            {/* 4. Buildable Footprint Envelope */}
            <rect
              x={70 + Math.min(80, sideSetback * 8)}
              y={30 + Math.min(50, sideSetback * 8)}
              width={Math.max(40, 360 - 2 * Math.min(80, sideSetback * 8))}
              height={Math.max(
                30,
                180 -
                  (Math.min(50, sideSetback * 8) +
                    Math.max(Math.min(60, frontSetback * 15), Math.min(50, sideSetback * 8)))
              )}
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth="1.8"
              rx="6"
              filter="url(#soft-shadow)"
            />
            <text
              x="250"
              y="108"
              fill="#78350F"
              fontSize="12"
              textAnchor="middle"
              fontWeight="700"
            >
              พื้นที่ขอบเขตก่อสร้างอาคาร ({formatNumber(massW, 1)} × {formatNumber(massD, 1)} ม.)
            </text>
            <text x="250" y="126" fill="#92400E" fontSize="10" textAnchor="middle" fontWeight="500">
              ร่นข้างและหลัง {sideSetback.toFixed(1)} ม. • ความสูงอาคาร {massH.toFixed(1)} ม. ({floorsCount} ชั้น)
            </text>

            {/* Height Indicator vertical line */}
            <line
              x1="446"
              y1="210"
              x2="446"
              y2="70"
              stroke="#D97706"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
            <line x1="442" y1="210" x2="450" y2="210" stroke="#D97706" strokeWidth="1.5" />
            <text
              x="458"
              y="140"
              fill="#B45309"
              fontSize="10"
              transform="rotate(90, 458, 140)"
              textAnchor="middle"
              fontWeight="600"
            >
              H ≤ {legalMaxHeight.toFixed(1)} ม.
            </text>
          </svg>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#48484A] mt-4 pt-3.5 border-t border-black/[0.05] w-full">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs border border-rose-500 border-dashed bg-[#FFE4E6]" />
            <span className="font-medium">พื้นที่ระยะร่น (Setback Zone)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#FEF3C7] border border-amber-500" />
            <span className="font-medium">ก้อนอาคาร 3D / Buildable Footprint</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-600" />
            <span className="font-medium">เส้นชั้นอาคาร (Floor Plates) & มิติความสูง H</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#E2E8F0] border border-slate-400" />
            <span className="font-medium">เขตทางถนนสาธารณะ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
