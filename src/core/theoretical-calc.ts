import { ZoneConfig, TypologyConfig, TheoreticalResult } from './types';

/**
 * Calculates Tier 1 Theoretical Maximum Limits based on BMA Comprehensive Plan 2556
 * - FAR (Floor Area Ratio): Maximum Gross Floor Area = Land Area * FAR
 * - OSR (Open Space Ratio): Minimum Open Space = (Gross Floor Area * OSR) / 100
 * - BCR (Building Coverage Ratio): Maximum Footprint = Land Area * BCR%
 */
export function calculateTheoreticalLimits(
  landAreaSqm: number,
  zone: ZoneConfig,
  typology: TypologyConfig
): TheoreticalResult {
  const safeLandArea = Math.max(0, Number(landAreaSqm) || 0);

  // 1. Max Gross Floor Area (ตาม FAR)
  const maxGrossFloorAreaSqm = Math.round(safeLandArea * zone.far * 100) / 100;

  // 2. Minimum Required Open Space (ตาม OSR ของผังเมือง)
  const minOpenSpaceSqm = Math.round(((maxGrossFloorAreaSqm * zone.osr) / 100) * 100) / 100;

  // 3. Max Building Coverage Ratio (BCR)
  // กำหนดโดยค่าต่ำสุดระหว่าง:
  // a) Max BCR ของโซนผังเมือง (เช่น 60%, 70%, 80%)
  // b) เกณฑ์ที่ว่างตามกฎกระทรวง ฉบับที่ 55 สำหรับประเภทอาคาร (เช่น ที่พักอาศัยต้องมีที่ว่างไม่น้อยกว่า 30% -> BCR สูงสุด 70%)
  const typologyMaxBcr = 100 - (typology.setbacks.min_open_space_ratio_bcr || 0);
  const effectiveMaxBcr = Math.min(zone.max_bcr, typologyMaxBcr);

  // 4. Max Ground Footprint
  const maxFootprintSqm = Math.round(safeLandArea * (effectiveMaxBcr / 100) * 100) / 100;

  return {
    far: zone.far,
    max_gross_floor_area_sqm: maxGrossFloorAreaSqm,
    osr_percentage: zone.osr,
    min_open_space_sqm: minOpenSpaceSqm,
    max_bcr_percentage: effectiveMaxBcr,
    max_footprint_sqm: maxFootprintSqm,
    legal_ref_id: zone.legal_ref || 'BMA_COMP_PLAN_2556_TABLE_1',
  };
}
