import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  raiNganWahToSqm,
  sqmToRaiNganWah,
  formatThaiArea,
} from '../src/core/unit-converter';
import { calculateTheoreticalLimits } from '../src/core/theoretical-calc';
import { evaluateRoadGatekeeper } from '../src/core/gatekeeper';
import { calculateEnvelopeConstraints } from '../src/core/envelope-calc';
import { calculateBuildingFeasibility, getAllZones, getAllTypologies } from '../src/core/calculator';

describe('Unit Converter Tests', () => {
  it('should correctly convert 1 Rai to 1,600 sqm', () => {
    const sqm = raiNganWahToSqm(1, 0, 0);
    assert.equal(sqm, 1600);
  });

  it('should correctly convert 1 Rai 2 Ngan 50 Sq.Wah to 2,600 sqm', () => {
    // 1600 + (2 * 400) + (50 * 4) = 1600 + 800 + 200 = 2600
    const sqm = raiNganWahToSqm(1, 2, 50);
    assert.equal(sqm, 2600);
  });

  it('should reverse convert 2,600 sqm to 1 Rai 2 Ngan 50 Sq.Wah', () => {
    const units = sqmToRaiNganWah(2600);
    assert.equal(units.rai, 1);
    assert.equal(units.ngan, 2);
    assert.equal(units.sqwah, 50);
    assert.equal(units.total_sqwah, 650);
  });

  it('should format Thai area string properly', () => {
    const formatted = formatThaiArea(2, 1, 25);
    assert.equal(formatted, '2 ไร่ 1 งาน 25 ตร.ว.');
  });
});

describe('Tier 1: Theoretical Calculation Tests', () => {
  const zones = getAllZones();
  const typologies = getAllTypologies();

  it('should calculate theoretical limits for Zone Y.4 (FAR 3.0, OSR 10%, BCR 70%) on 100 Sq.Wah (400 sqm)', () => {
    const zoneY4 = zones['Y4'];
    const condo = typologies['LOW_RISE_CONDO'];

    const result = calculateTheoreticalLimits(400, zoneY4, condo);

    // Max Gross Floor Area = 400 * 3.0 = 1,200 sqm
    assert.equal(result.max_gross_floor_area_sqm, 1200);
    // Min Open Space = 1,200 * 10% = 120 sqm
    assert.equal(result.min_open_space_sqm, 120);
    // Effective BCR = min(70%, 70%) = 70%
    assert.equal(result.max_bcr_percentage, 70);
    // Max Footprint = 400 * 70% = 280 sqm
    assert.equal(result.max_footprint_sqm, 280);
  });

  it('should calculate theoretical limits for Zone P.5 (FAR 10.0, OSR 3%, BCR 80%) on 1 Rai (1,600 sqm)', () => {
    const zoneP5 = zones['P5'];
    const office = typologies['OFFICE_BUILDING'];

    const result = calculateTheoreticalLimits(1600, zoneP5, office);

    // Max Gross Floor Area = 1,600 * 10.0 = 16,000 sqm
    assert.equal(result.max_gross_floor_area_sqm, 16000);
    // Min Open Space = 16,000 * 3% = 480 sqm
    assert.equal(result.min_open_space_sqm, 480);
    // Effective BCR = min(80%, 90%) = 80%
    assert.equal(result.max_bcr_percentage, 80);
    // Max Footprint = 1,600 * 80% = 1,280 sqm
    assert.equal(result.max_footprint_sqm, 1280);
  });
});

describe('Road Width Gatekeeper Tests', () => {
  const typologies = getAllTypologies();

  it('should flag VIOLATION for High-Rise building on an 8.0m road (< 10.0m requirement)', () => {
    const highrise = typologies['HIGH_RISE_EXTRA_LARGE'];
    const result = evaluateRoadGatekeeper(8.0, highrise, 15000);

    assert.equal(result.status, 'VIOLATION');
    assert.equal(result.violations.length, 1);
    assert.equal(result.violations[0].rule_id, 'RULE_HIGHRISE_ROAD_LT_10M');
    assert.equal(result.violations[0].severity, 'ERROR');
  });

  it('should PASS High-Rise building on a 10.0m road', () => {
    const highrise = typologies['HIGH_RISE_EXTRA_LARGE'];
    const result = evaluateRoadGatekeeper(10.0, highrise, 15000);

    assert.equal(result.status, 'PASSED');
    assert.equal(result.violations.length, 0);
  });

  it('should flag WARNING for Low-Rise Condo on a 5.0m road (< 6.0m BMA limit)', () => {
    const condo = typologies['LOW_RISE_CONDO'];
    const result = evaluateRoadGatekeeper(5.0, condo, 1800);

    assert.equal(result.status, 'WARNING');
    assert.equal(result.violations.length, 1);
    assert.equal(result.violations[0].rule_id, 'RULE_CONDO_ROAD_LT_6M');
  });
});

describe('Tier 2: Envelope & Height Constraints Tests (BMA Bylaws 2544)', () => {
  const typologies = getAllTypologies();
  const condo = typologies['LOW_RISE_CONDO'];

  it('Road < 6.0m (e.g. 5.0m): setback from center 3.0m, boundary setback 0.5m, max height 11.0m', () => {
    const env = calculateEnvelopeConstraints(5.0, condo);

    assert.equal(env.road_setback_from_center_m, 3.0);
    // 3.0 - (5.0 / 2) = 0.5m
    assert.equal(env.road_setback_from_boundary_m, 0.5);
    // 2 * (5.0 + 0.5) = 11.0m
    assert.equal(env.max_building_height_at_front_m, 11.0);
    // 11.0 / 3.0 = 3 floors
    assert.equal(env.estimated_max_floors, 3);
  });

  it('Road 6.0m - 10.0m (e.g. 8.0m): setback from center 3.5m, boundary setback 0m, max height 16.0m', () => {
    const env = calculateEnvelopeConstraints(8.0, condo);

    assert.equal(env.road_setback_from_center_m, 3.5);
    // 3.5 - (8.0 / 2) = -0.5 -> max(0, -0.5) = 0
    assert.equal(env.road_setback_from_boundary_m, 0);
    // 2 * (8.0 + 0) = 16.0m
    assert.equal(env.max_building_height_at_front_m, 16.0);
  });

  it('Road 10.0m - 20.0m (e.g. 12.0m): boundary setback 10% = 1.2m, max height 26.4m', () => {
    const env = calculateEnvelopeConstraints(12.0, condo);

    // 12.0 * 0.1 = 1.2m
    assert.equal(env.road_setback_from_boundary_m, 1.2);
    // 2 * (12.0 + 1.2) = 26.4m
    assert.equal(env.max_building_height_at_front_m, 26.4);
  });

  it('should detect realistic footprint constraint when narrow dimensions are given', () => {
    // Narrow land: Width 12m, Depth 30m (360 sqm)
    // Condo requires 3m side setbacks -> Buildable width = 12 - 2*(3) = 6m!
    // Front setback (road 6m -> 0.5m) + rear setback (3m) = 3.5m -> Buildable depth = 30 - 3.5 = 26.5m
    // Realistic footprint = 6m * 26.5m = 159 sqm
    // Theoretical max footprint in Y.4 (70%) on 360 sqm = 252 sqm
    // So geometric envelope cuts the footprint down from 252 sqm to 159 sqm!
    const env = calculateEnvelopeConstraints(
      6.0,
      condo,
      { width_frontage_m: 12, depth_m: 30 },
      252
    );

    assert.equal(env.realistic_footprint_sqm, 159);
    assert.equal(env.is_footprint_limited_by_setback, true);
  });
});

describe('Full Pipeline Integration Tests', () => {
  it('should run end-to-end calculation for Sukhumvit CBD Commercial Plot (Zone P.5)', () => {
    const result = calculateBuildingFeasibility({
      input_mode: 'TOTAL_AREA',
      total_area: { rai: 2, ngan: 0, sqwah: 0 }, // 2 Rai = 3,200 sqm
      road_width_m: 18.0,
      selected_zone_key: 'P5',
      selected_typology_id: 'HIGH_RISE_EXTRA_LARGE',
    });

    assert.equal(result.input_summary.land_area_sqm, 3200);
    assert.equal(result.input_summary.zone_code, 'พ.5');
    assert.equal(result.theoretical.far, 10.0);
    assert.equal(result.theoretical.max_gross_floor_area_sqm, 32000);
    assert.equal(result.gatekeeper.status, 'PASSED');
    assert.ok(result.citations.length >= 3);
  });
});
