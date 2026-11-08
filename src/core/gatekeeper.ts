import { TypologyConfig, GatekeeperViolation } from './types';

export interface GatekeeperEvaluationResult {
  status: 'PASSED' | 'WARNING' | 'VIOLATION';
  violations: GatekeeperViolation[];
}

/**
 * Evaluates whether the land and road width meet the legal gatekeeper constraints for the selected building typology.
 * E.g., High-rise / Extra large buildings require at least 10.0m public road width (MR 33).
 * Condominiums / Offices on roads under 6.0m are capped at 2,000 sq.m.
 */
export function evaluateRoadGatekeeper(
  roadWidthM: number,
  typology: TypologyConfig,
  estimatedFloorAreaSqm: number = 0
): GatekeeperEvaluationResult {
  const violations: GatekeeperViolation[] = [];
  const roadWidth = Math.max(0, Number(roadWidthM) || 0);

  // 1. High-rise / Extra-Large Building checks
  if (typology.id === 'HIGH_RISE_EXTRA_LARGE') {
    if (roadWidth < 10.0) {
      violations.push({
        rule_id: 'RULE_HIGHRISE_ROAD_LT_10M',
        severity: 'ERROR',
        title: 'ไม่สามารถก่อสร้างอาคารสูงหรืออาคารขนาดใหญ่พิเศษได้',
        message: `ถนนสาธารณะกว้าง ${roadWidth.toFixed(1)} ม. (เกณฑ์ขั้นต่ำ 10.00 ม.) ที่ดินแปลงนี้จึงไม่สามารถขออนุญาตก่อสร้างอาคารสูง (ความสูง ≥ 23 ม.) หรืออาคารขนาดใหญ่พิเศษ (พื้นที่ > 10,000 ตร.ม.) ได้ตามกฎกระทรวง ฉบับที่ 33 (พ.ศ. 2535) ข้อ 2`,
        legal_ref_id: 'MR_33_CLAUSE_2',
      });
    } else if (estimatedFloorAreaSqm > 30000 && roadWidth < 12.0) {
      violations.push({
        rule_id: 'RULE_HIGHRISE_ROAD_LT_12M_LARGE',
        severity: 'ERROR',
        title: 'ความกว้างถนนไม่เพียงพอสำหรับอาคารขนาดเกิน 30,000 ตร.ม.',
        message: `พื้นที่อาคารรวมตามสิทธิ (${estimatedFloorAreaSqm.toLocaleString()} ตร.ม.) เกิน 30,000 ตร.ม. กฎหมายกำหนดให้ต้องอยู่ติดถนนสาธารณะกว้างไม่น้อยกว่า 12.00 ม. (หากพื้นที่เกิน 30,000 ตร.ม.) หรือ 18.00 ม. ตามกฎกระทรวง ฉบับที่ 50`,
        legal_ref_id: 'MR_33_CLAUSE_2_AMENDED',
      });
    }
  }

  // 2. Multi-family residential / Low-rise condo checks
  if (typology.id === 'LOW_RISE_CONDO') {
    if (roadWidth < 6.0) {
      violations.push({
        rule_id: 'RULE_CONDO_ROAD_LT_6M',
        severity: 'WARNING',
        title: 'ข้อจำกัดขนาดอาคารอยู่อาศัยรวมในซอยแคบ (< 6.00 ม.)',
        message: `ถนนสาธารณะกว้าง ${roadWidth.toFixed(1)} ม. (น้อยกว่า 6.00 ม.) อาคารพักอาศัยรวมจะมีพื้นที่อาคารรวมได้ไม่เกิน 2,000 ตร.ม. และไม่สามารถเป็นอาคารขนาดใหญ่ได้ตามข้อกำหนดผังเมืองรวม กทม. 2556`,
        legal_ref_id: 'BMA_COMP_PLAN_2556_ITEM_RESIDENTIAL',
      });
    }
  }

  // 3. Office / Commercial building checks
  if (typology.id === 'OFFICE_BUILDING') {
    if (roadWidth < 6.0 && estimatedFloorAreaSqm > 2000) {
      violations.push({
        rule_id: 'RULE_OFFICE_ROAD_LT_6M',
        severity: 'WARNING',
        title: 'ข้อจำกัดอาคารสำนักงานในซอยแคบ (< 6.00 ม.)',
        message: `ถนนสาธารณะกว้าง ${roadWidth.toFixed(1)} ม. (น้อยกว่า 6.00 ม.) ไม่สามารถก่อสร้างอาคารสำนักงานขนาดใหญ่ที่มีพื้นที่เกิน 2,000 ตร.ม. ได้ตามกฎกระทรวง ฉบับที่ 55 ข้อ 42`,
        legal_ref_id: 'MR_55_CLAUSE_42',
      });
    }
  }

  // Evaluate overall status
  let status: 'PASSED' | 'WARNING' | 'VIOLATION' = 'PASSED';
  if (violations.some((v) => v.severity === 'ERROR')) {
    status = 'VIOLATION';
  } else if (violations.some((v) => v.severity === 'WARNING')) {
    status = 'WARNING';
  }

  return {
    status,
    violations,
  };
}
