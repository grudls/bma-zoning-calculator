import {
  UserInput,
  CalculationResult,
  ZoneConfig,
  TypologyConfig,
  LegalCitation,
} from './types';
import {
  raiNganWahToSqm,
  sqmToRaiNganWah,
  deriveDimensionsFromSqm,
} from './unit-converter';
import { evaluateRoadGatekeeper } from './gatekeeper';
import { calculateTheoreticalLimits } from './theoretical-calc';
import { calculateEnvelopeConstraints } from './envelope-calc';

import zoningData from '../data/bma-zoning-2556.json';
import typologyData from '../data/building-typologies.json';
import citationData from '../data/legal-citations.json';

const zonesRecord = (zoningData as unknown as { zones: Record<string, ZoneConfig> }).zones;
const typologiesRecord = (typologyData as unknown as { typologies: Record<string, TypologyConfig> }).typologies;
const citationsRecord = (citationData as unknown as { citations: Record<string, LegalCitation> }).citations;

export function getAllZones(): Record<string, ZoneConfig> {
  return zonesRecord;
}

export function getAllTypologies(): Record<string, TypologyConfig> {
  return typologiesRecord;
}

export function getCitation(id: string): LegalCitation | undefined {
  return citationsRecord[id];
}

/**
 * Main Calculation Pipeline:
 * 1. Normalize land area & synchronize dimensions (Two-way consistency)
 * 2. Lookup zone and typology configs
 * 3. Evaluate road width gatekeeper
 * 4. Calculate Tier 1 theoretical maximums
 * 5. Calculate Tier 2 envelope & height constraints
 * 6. Collect all legal citations
 */
export function calculateBuildingFeasibility(input: UserInput): CalculationResult {
  // 1. Normalize Land Area & Synchronize Dimensions
  let landAreaSqm = 0;
  let effectiveDimensions = { width_frontage_m: 0, depth_m: 0 };

  if (input.input_mode === 'TOTAL_AREA' && input.total_area) {
    landAreaSqm = raiNganWahToSqm(
      input.total_area.rai,
      input.total_area.ngan,
      input.total_area.sqwah,
      input.total_area.sqm_override
    );
    effectiveDimensions = deriveDimensionsFromSqm(landAreaSqm, input.dimensions);
  } else if (input.input_mode === 'DIMENSIONS' && input.dimensions) {
    const w = Math.max(0, Number(input.dimensions.width_frontage_m) || 0);
    const d = Math.max(0, Number(input.dimensions.depth_m) || 0);
    landAreaSqm = Math.round(w * d * 100) / 100;
    effectiveDimensions = { width_frontage_m: w, depth_m: d };
  }

  const thaiUnits = sqmToRaiNganWah(landAreaSqm);

  // 2. Resolve Configs
  const zoneKey = input.selected_zone_key || 'Y4';
  const zone = zonesRecord[zoneKey] || zonesRecord['Y4'];

  const typologyId = input.selected_typology_id || 'LOW_RISE_CONDO';
  const typology = typologiesRecord[typologyId] || typologiesRecord['LOW_RISE_CONDO'];

  // 3. Tier 1: Theoretical Calculation
  const theoretical = calculateTheoreticalLimits(landAreaSqm, zone, typology);

  // 4. Gatekeeper Evaluation
  const gatekeeper = evaluateRoadGatekeeper(
    input.road_width_m,
    typology,
    theoretical.max_gross_floor_area_sqm
  );

  // 5. Tier 2: Envelope & Height Calculation (using synchronized effectiveDimensions)
  const envelope = calculateEnvelopeConstraints(
    input.road_width_m,
    typology,
    effectiveDimensions,
    theoretical.max_footprint_sqm
  );

  // 6. Resolve all relevant citations
  const citationIds = new Set<string>();
  if (theoretical.legal_ref_id) citationIds.add(theoretical.legal_ref_id);
  if (typology.legal_ref) citationIds.add(typology.legal_ref);
  envelope.legal_ref_ids.forEach((id: string) => citationIds.add(id));
  gatekeeper.violations.forEach((v) => {
    if (v.legal_ref_id) citationIds.add(v.legal_ref_id);
  });

  const citations: LegalCitation[] = Array.from(citationIds)
    .map((id) => citationsRecord[id])
    .filter((c): c is LegalCitation => Boolean(c));

  return {
    input_summary: {
      land_area_sqm: landAreaSqm,
      land_area_sqwah: thaiUnits.total_sqwah,
      rai: thaiUnits.rai,
      ngan: thaiUnits.ngan,
      sqwah: thaiUnits.sqwah,
      width_frontage_m: effectiveDimensions.width_frontage_m,
      depth_m: effectiveDimensions.depth_m,
      road_width_m: input.road_width_m,
      zone_code: zone.code,
      zone_name: zone.name_th,
      typology_id: typology.id,
      typology_name: typology.name_th,
    },
    gatekeeper,
    theoretical,
    envelope,
    citations,
  };
}
