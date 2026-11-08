/**
 * Unit conversion utilities for Thai land measurements and metric units
 * 1 ไร่ = 4 งาน = 400 ตารางวา = 1,600 ตารางเมตร
 * 1 งาน = 100 ตารางวา = 400 ตารางเมตร
 * 1 ตารางวา = 4 ตารางเมตร
 */

export interface ThaiLandArea {
  rai: number;
  ngan: number;
  sqwah: number;
  total_sqwah: number;
  total_sqm: number;
}

/**
 * Converts Rai, Ngan, and Sq.Wah to total square meters
 */
export function raiNganWahToSqm(
  rai: number = 0,
  ngan: number = 0,
  sqwah: number = 0,
  sqmOverride?: number
): number {
  if (sqmOverride !== undefined && sqmOverride > 0) {
    return Math.round(sqmOverride * 100) / 100;
  }
  const totalSqm = (Number(rai) || 0) * 1600 + (Number(ngan) || 0) * 400 + (Number(sqwah) || 0) * 4;
  return Math.round(totalSqm * 100) / 100;
}

/**
 * Converts square meters to Thai land units (Rai, Ngan, Sq.Wah)
 */
export function sqmToRaiNganWah(sqm: number): ThaiLandArea {
  const safeSqm = Math.max(0, Number(sqm) || 0);
  const totalSqwah = safeSqm / 4;

  const rai = Math.floor(safeSqm / 1600);
  const remAfterRai = safeSqm % 1600;

  const ngan = Math.floor(remAfterRai / 400);
  const remAfterNgan = remAfterRai % 400;

  const sqwah = Math.round((remAfterNgan / 4) * 100) / 100;

  return {
    rai,
    ngan,
    sqwah,
    total_sqwah: Math.round(totalSqwah * 100) / 100,
    total_sqm: Math.round(safeSqm * 100) / 100,
  };
}

/**
 * Converts dimensions (Width x Depth) to total square meters and Thai land units
 */
export function dimensionsToArea(widthM: number, depthM: number): ThaiLandArea {
  const safeW = Math.max(0, Number(widthM) || 0);
  const safeD = Math.max(0, Number(depthM) || 0);
  const sqm = safeW * safeD;
  return sqmToRaiNganWah(sqm);
}

/**
 * Formats Thai land area as readable string e.g. "1 ไร่ 2 งาน 50 ตร.ว."
 */
export function formatThaiArea(rai: number, ngan: number, sqwah: number): string {
  const parts: string[] = [];
  if (rai > 0) parts.push(`${rai} ไร่`);
  if (ngan > 0) parts.push(`${ngan} งาน`);
  if (sqwah > 0 || parts.length === 0) parts.push(`${sqwah} ตร.ว.`);
  return parts.join(' ');
}

/**
 * Formats number with commas and specified decimals
 */
export function formatNumber(val: number, decimals: number = 2): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('th-TH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
