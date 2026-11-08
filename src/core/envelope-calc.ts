import { TypologyConfig, DimensionsInput, EnvelopeResult } from './types';

/**
 * Calculates Tier 2 Envelope & Height Constraints
 * Based on BMA Bylaws B.E. 2544 (ข้อบัญญัติ กทม. 2544 ข้อ 54 & ข้อ 44)
 */
export function calculateEnvelopeConstraints(
  roadWidthM: number,
  typology: TypologyConfig,
  dimensions?: DimensionsInput,
  theoreticalFootprintSqm?: number
): EnvelopeResult {
  const roadWidth = Math.max(0, Number(roadWidthM) || 0);

  // 1. Calculate Road Setbacks (ข้อ 54 ข้อบัญญัติ กทม. 2544)
  let roadSetbackFromCenterM = 0;
  let roadSetbackFromBoundaryM = 0;

  if (roadWidth < 6.0) {
    // ถนนกว้างน้อยกว่า 6.00 ม. ร่นจากกึ่งกลางถนนอย่างน้อย 3.00 ม.
    roadSetbackFromCenterM = 3.0;
    roadSetbackFromBoundaryM = Math.max(0, 3.0 - roadWidth / 2);
  } else if (roadWidth >= 6.0 && roadWidth < 10.0) {
    // ถนนกว้าง 6.00 - 10.00 ม. ร่นจากกึ่งกลางถนนอย่างน้อย 3.50 ม.
    roadSetbackFromCenterM = 3.5;
    roadSetbackFromBoundaryM = Math.max(0, 3.5 - roadWidth / 2);
  } else if (roadWidth >= 10.0 && roadWidth < 20.0) {
    // ถนนกว้าง 10.00 - 20.00 ม. ร่นจากเขตทางอย่างน้อย 1 ใน 10 ของความกว้างเขตทาง
    roadSetbackFromCenterM = roadWidth / 2 + roadWidth * 0.1;
    roadSetbackFromBoundaryM = Math.round(roadWidth * 0.1 * 100) / 100;
  } else {
    // ถนนกว้าง 20.00 ม. ขึ้นไป ร่นจากเขตทางอย่างน้อย 2.00 ม.
    roadSetbackFromCenterM = roadWidth / 2 + 2.0;
    roadSetbackFromBoundaryM = 2.0;
  }

  // 2. Maximum Building Height at Front Setback Line (ข้อ 44 ข้อบัญญัติ กทม. 2544)
  // ความสูงไม่เกิน 2 เท่าของระยะห่างในแนวนอนไปถึงแนวเขตทางฝั่งตรงข้าม
  // Distance to opposite road boundary = roadWidth + roadSetbackFromBoundaryM
  const distanceToOppositeRoadBoundary = roadWidth + roadSetbackFromBoundaryM;
  const maxBuildingHeightAtFrontM = Math.round(2 * distanceToOppositeRoadBoundary * 100) / 100;

  // Floor height estimate
  const floorHeight = typology.default_floor_height_m || 3.2;
  const estimatedMaxFloors = Math.floor(maxBuildingHeightAtFrontM / floorHeight);

  // Side and rear setbacks from property lines
  const sideBackSetbackM = typology.setbacks.surrounding_open_space_m || typology.setbacks.boundary_side_back_m || 2.0;

  // 3. Geometric Buildable Footprint Calculation (If Dimensions are provided)
  let realisticFootprintSqm: number | undefined = undefined;
  let isFootprintLimitedBySetback = false;

  if (dimensions && dimensions.width_frontage_m > 0 && dimensions.depth_m > 0) {
    const buildableWidth = Math.max(0, dimensions.width_frontage_m - 2 * sideBackSetbackM);
    const buildableDepth = Math.max(0, dimensions.depth_m - (roadSetbackFromBoundaryM + sideBackSetbackM));

    realisticFootprintSqm = Math.round(buildableWidth * buildableDepth * 100) / 100;

    if (theoreticalFootprintSqm !== undefined && realisticFootprintSqm < theoreticalFootprintSqm) {
      isFootprintLimitedBySetback = true;
    }
  }

  return {
    road_setback_from_center_m: Math.round(roadSetbackFromCenterM * 100) / 100,
    road_setback_from_boundary_m: Math.round(roadSetbackFromBoundaryM * 100) / 100,
    boundary_side_back_setback_m: sideBackSetbackM,
    max_building_height_at_front_m: maxBuildingHeightAtFrontM,
    estimated_max_floors: estimatedMaxFloors,
    road_width_m: roadWidth,
    realistic_footprint_sqm: realisticFootprintSqm,
    is_footprint_limited_by_setback: isFootprintLimitedBySetback,
    legal_ref_ids: ['BMA_BYLAW_2544_CLAUSE_54', 'BMA_BYLAW_2544_CLAUSE_44'],
  };
}
