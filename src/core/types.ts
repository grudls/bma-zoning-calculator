export type LandInputMode = 'TOTAL_AREA' | 'DIMENSIONS';

export interface TotalAreaInput {
  rai: number;
  ngan: number;
  sqwah: number;
  sqm_override?: number;
}

export interface DimensionsInput {
  width_frontage_m: number;
  depth_m: number;
}

export interface UserInput {
  input_mode: LandInputMode;
  total_area?: TotalAreaInput;
  dimensions?: DimensionsInput;
  road_width_m: number;
  selected_zone_key: string;       // e.g. "Y1", "Y4", "Y9", "P5"
  selected_typology_id: string;    // e.g. "SINGLE_FAMILY_HOUSE", "LOW_RISE_CONDO", "HIGH_RISE_EXTRA_LARGE", "OFFICE_BUILDING"
}

export interface ZoneConfig {
  code: string;
  name_th: string;
  category: string;
  color: string;
  far: number;
  osr: number;
  max_bcr: number;
  description: string;
  legal_ref: string;
}

export interface GatekeeperRule {
  id: string;
  condition: string;
  severity: 'WARNING' | 'ERROR';
  title: string;
  message: string;
  legal_ref: string;
}

export interface TypologyConfig {
  id: string;
  name_th: string;
  category: string;
  min_road_width_m: number;
  min_frontage_m?: number;
  max_floor_area_sqm_if_road_under_6m?: number;
  default_floor_height_m: number;
  setbacks: {
    boundary_side_back_m: number;
    surrounding_open_space_m?: number;
    min_open_space_ratio_bcr: number;
  };
  gatekeeper_rules: GatekeeperRule[];
  legal_ref: string;
}

export interface LegalCitation {
  id: string;
  law_name: string;
  section: string;
  summary: string;
  authority?: string;
  url?: string;
}

export interface GatekeeperViolation {
  rule_id: string;
  severity: 'WARNING' | 'ERROR';
  title: string;
  message: string;
  legal_ref_id: string;
}

export interface TheoreticalResult {
  far: number;
  max_gross_floor_area_sqm: number;
  osr_percentage: number;
  min_open_space_sqm: number;
  max_bcr_percentage: number;
  max_footprint_sqm: number;
  legal_ref_id: string;
}

export interface EnvelopeResult {
  road_setback_from_center_m: number;
  road_setback_from_boundary_m: number;
  boundary_side_back_setback_m: number;
  max_building_height_at_front_m: number;
  estimated_max_floors: number;
  road_width_m: number;
  realistic_footprint_sqm?: number;
  is_footprint_limited_by_setback?: boolean;
  legal_ref_ids: string[];
}

export interface CalculationResult {
  input_summary: {
    land_area_sqm: number;
    land_area_sqwah: number;
    rai: number;
    ngan: number;
    sqwah: number;
    road_width_m: number;
    zone_code: string;
    zone_name: string;
    typology_name: string;
  };
  gatekeeper: {
    status: 'PASSED' | 'WARNING' | 'VIOLATION';
    violations: GatekeeperViolation[];
  };
  theoretical: TheoreticalResult;
  envelope: EnvelopeResult;
  citations: LegalCitation[];
}
