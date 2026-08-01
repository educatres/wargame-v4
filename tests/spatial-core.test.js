const test = require("node:test");
const assert = require("node:assert/strict");
const spatial = require("../spatial-core.js");

test("haversine returns the expected short distance", () => {
  const km = spatial.haversineKm({ lat: 25.033, lng: 121.5654 }, { lat: 25.0478, lng: 121.5319 });
  assert.ok(km > 3.6 && km < 4.2);
});

test("grid step keeps the visible map near the requested line density", () => {
  const wide = spatial.gridLinesForBounds({ south: 20, west: 116, north: 28, east: 128 }, 10);
  const close = spatial.gridLinesForBounds({ south: 23.4, west: 120.8, north: 24.1, east: 121.7 }, 10);
  assert.equal(wide.step, 2);
  assert.equal(close.step, 0.1);
  assert.ok(wide.latitudes.length <= 10);
  assert.ok(wide.longitudes.length <= 10);
});

test("grid coordinate labels use hemispheres and zoom-sensitive precision", () => {
  assert.equal(spatial.formatGridCoordinate(24, "lat", 1), "24°N");
  assert.equal(spatial.formatGridCoordinate(-23.5, "lat", 0.5), "23.5°S");
  assert.equal(spatial.formatGridCoordinate(-121.25, "lng", 0.25), "121.25°W");
  assert.equal(spatial.formatGridCoordinate(121.05, "lng", 0.05), "121.05°E");
});

test("grid generation supports bounds crossing the antimeridian", () => {
  const grid = spatial.gridLinesForBounds({ south: -5, west: 175, north: 5, east: -175 }, 10);
  assert.equal(grid.east, 185);
  assert.ok(grid.longitudes.includes(180));
  assert.equal(spatial.formatGridCoordinate(180, "lng", grid.step), "180°W");
});

test("eligible placement includes the exact range boundary and rejects outside", () => {
  const row = {
    id: "R1", category: "position", reserve: 0, gameRangeKm: 80, locationRequired: true,
    placements: [{ placementId: "P1", label: "A", lat: 0, lng: 0, nominalQuantity: 10, currentQuantity: 10 }]
  };
  assert.equal(spatial.eligiblePlacements(row, { lat: 0, lng: 0.7194 }, 2).length, 1);
  assert.equal(spatial.eligiblePlacements(row, { lat: 0, lng: 0.73 }, 2).length, 0);
});

test("eligible placements are ordered nearest-first for automatic selection", () => {
  const row = {
    id: "AUTO", category: "aviation", reserve: 0, gameRangeKm: 600,
    placements: [
      { placementId: "FAR", lat: 24, lng: 124, nominalQuantity: 10, currentQuantity: 10 },
      { placementId: "NEAR", lat: 24, lng: 121, nominalQuantity: 10, currentQuantity: 10 }
    ]
  };
  const eligible = spatial.eligiblePlacements(row, { lat: 24, lng: 121.2 }, 2);
  assert.equal(eligible[0].placement.placementId, "NEAR");
});

test("multi-location totals and validation enforce nominal equality", () => {
  const row = {
    id: "R2", category: "airport", nominal: 6, locationRequired: true,
    placements: [
      { placementId: "P1", lat: 23, lng: 121, nominalQuantity: 2, currentQuantity: 2 },
      { placementId: "P2", lat: 24, lng: 121, nominalQuantity: 4, currentQuantity: 3 }
    ]
  };
  assert.deepEqual(spatial.placementTotals(row), { nominal: 6, current: 5 });
  assert.deepEqual(spatial.validateSpatialRow(row), []);
  assert.match(spatial.validateSpatialRow({ ...row, nominal: 7 })[0], /必須等於/);
});

test("placement consumption respects reserve", () => {
  const row = {
    id: "R3", category: "aviation", reserve: 20,
    placements: [{ placementId: "P1", lat: 23, lng: 121, nominalQuantity: 10, currentQuantity: 10 }]
  };
  const result = spatial.consumePlacement(row, "P1", 9, true);
  assert.equal(result.used, 8);
  assert.equal(result.spatial.placements[0].currentQuantity, 2);
});

test("recovery is distributed without exceeding placement nominal", () => {
  const row = {
    id: "R4", category: "base",
    placements: [
      { placementId: "P1", lat: 23, lng: 121, nominalQuantity: 5, currentQuantity: 2 },
      { placementId: "P2", lat: 24, lng: 121, nominalQuantity: 5, currentQuantity: 4 }
    ]
  };
  const result = spatial.distributeRecovery(row, 3);
  assert.equal(result.applied, 3);
  assert.equal(spatial.placementTotals(result.spatial).current, 9);
});

test("only opposed targets within 50 km form a spatial conflict", () => {
  const actions = [
    { actor: "RED", combat: true, target: { lat: 23.5, lng: 121 } },
    { actor: "BLUE", combat: true, target: { lat: 23.6, lng: 121 } },
    { actor: "AMBER", combat: true, target: { lat: 26, lng: 121 } }
  ];
  const groups = spatial.clusterOpposedActions(actions, 50);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].actions.length, 2);
});

test("legacy rows receive range defaults but remain pending placement", () => {
  const migrated = { id: "OLD", category: "radarStation", nominal: 8, ...spatial.normalizeSpatialRow({ id: "OLD", category: "radarStation" }) };
  assert.equal(migrated.gameRangeKm, 450);
  assert.equal(migrated.locationRequired, true);
  assert.match(spatial.validateSpatialRow(migrated)[0], /尚未配置/);
});

test("catalog canonicalization expands equipment shorthand without changing quantity", () => {
  const result = spatial.canonicalizeCatalogNames("出動 3 架 KC46 執行空中加油", [{
    canonical: "KC-46A Pegasus",
    variants: ["kc46a", "kc46", "pegasus"]
  }]);
  assert.equal(result.text, "出動 3 架 KC-46A Pegasus 執行空中加油");
  assert.equal(result.replacements[0].changed, true);
});

test("catalog canonicalization leaves an existing canonical name unchanged", () => {
  const result = spatial.canonicalizeCatalogNames("使用 KC-46A Pegasus 支援", [{
    canonical: "KC-46A Pegasus",
    variants: ["kc46a", "kc46"]
  }]);
  assert.equal(result.text, "使用 KC-46A Pegasus 支援");
  assert.equal(result.replacements[0].changed, false);
});
