const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const css = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");

test("main animation updates Leaflet geographic markers instead of canvas pixels", () => {
  const start = app.indexOf("function stepOperationAnimation");
  const end = app.indexOf("function toggleOperationAnimation", start);
  const body = app.slice(start, end);
  assert.match(body, /updateGeographicAnimation/);
  assert.doesNotMatch(body, /drawOperationFrame/);
});

test("AAR replay uses an OpenStreetMap Leaflet container and geographic markers", () => {
  assert.match(app, /id="aarReplayMap"/);
  assert.match(app, /function renderAarReplayLeafletLayers/);
  assert.match(app, /_aarLeafletMarker\.setLatLng/);
  assert.match(html, /© OpenStreetMap contributors/);
});

test("new turn snapshots preserve immutable source placements for replay", () => {
  assert.match(app, /spatialInventoryBefore:\s*JSON\.parse\(JSON\.stringify\(turnCheckpoint\.detailedInventory/);
  assert.match(app, /operationActionOrigin\(action, scene/);
});

test("spatial confirmation supports automatic target and nearest placement selection", () => {
  assert.match(app, /function autoSelectSpatialItem/);
  assert.match(app, /chooseConcreteMapTarget\(pendingSpatialOrder\.parsed\.actor, item, row, allocation\)/);
  assert.match(app, /function configuredTargetCandidates/);
  assert.match(app, /function publicFacilityTargetCandidates/);
  assert.match(app, /applyAutomaticSpatialSourcePlan\(item, row, allocation\)/);
  assert.match(app, /SPATIAL\.placementAllocationPlan/);
  assert.match(app, /function autoSelectAllSpatialItems/);
  assert.match(html, /id="autoSelectSpatialOrderBtn"/);
});

test("spatial confirmation opens as a full-screen map review dialog", () => {
  assert.match(html, /id="spatialOrderTargetPanel"[^>]+role="dialog"[^>]+aria-modal="true"/);
  assert.match(html, /id="spatialOrderReviewMap"[^>]+aria-label="發射與任務空間配置確認地圖"/);
  assert.match(app, /function ensureSpatialOrderReviewMap\(\)/);
  assert.match(app, /renderSpatialOrderReviewMap\(true\)/);
  assert.match(app, /spatialOrderReviewMap\.on\("click"/);
  assert.match(css, /\.spatial-order-target-panel\s*\{[\s\S]*position:\s*fixed;\s*inset:\s*0;[\s\S]*z-index:\s*2200;/);
  assert.match(css, /\.spatial-order-dialog-body\s*\{[\s\S]*grid-template-columns:/);
});

test("red quick orders include a concrete inventory quantity and public map target", () => {
  assert.match(html, /發射10枚東風-17常規導彈攻擊台中港/);
  assert.match(html, />DF-17 攻擊台中港<\/button>/);
});

test("new geographic targets prefer configured or public map locations over abstract zone centers", () => {
  assert.match(app, /function chooseConcreteMapTarget/);
  assert.match(app, /configuredTargetCandidates\(actor, item\)/);
  assert.match(app, /publicFacilityTargetCandidates\(actor, item\)/);
  const start = app.indexOf("function autoSelectSpatialItem");
  const end = app.indexOf("function autoSelectAllSpatialItems", start);
  assert.doesNotMatch(app.slice(start, end), /自動區域中心/);
});

test("spatial confirmation allows an explicit no-placement choice when resources are insufficient", () => {
  assert.match(app, /SKIP_SPATIAL_PLACEMENT = "__NO_PLACEMENT__"/);
  assert.match(app, /不選擇（不投入品項資源）/);
  assert.match(app, /item\.assetAllocationSkipped = select\.value === SKIP_SPATIAL_PLACEMENT/);
  assert.match(app, /allocationSkipped \|\| selectedSpatialSourcesValid/);
  assert.match(app, /if \(event\.target\.closest\("select, input, option, label"\)\) return;/);
  assert.match(html, /資源不足時可選擇「不選擇」/);
});

test("a skipped placement has no item power, inventory consumption, or false route origin", () => {
  assert.match(app, /function weaponPowerForOrderItem[\s\S]*?if \(item\?\.assetAllocationSkipped\) return 0;/);
  assert.match(app, /if \(item\.assetAllocationSkipped\) return;\s*const allocations = Array\.isArray\(item\.assetAllocations\)/);
  assert.match(app, /function operationActionOrigin[\s\S]*?if \(action\?\.assetAllocationSkipped\) return null;/);
  assert.match(app, /assetAllocations: \(item\?\.assetAllocationSkipped \? \[\]/);
});

test("all Leaflet maps receive adaptive grid and zone reference layers", () => {
  assert.match(app, /attachMapReferenceLayers\(map/);
  assert.match(app, /SPATIAL\.gridLinesForBounds/);
  assert.match(app, /Object\.entries\(SPATIAL\.ZONE_CENTERS\)/);
  assert.match(app, /map\.on\("moveend zoomend resize", refresh\)/);
});

test("map reference overlays can be toggled without entering scenario data", () => {
  assert.match(app, /data-map-reference-layer="grid"/);
  assert.match(app, /data-map-reference-layer="zones"/);
  assert.match(app, /labels\.grid = "經緯格線"/);
  assert.match(app, /labels\.zones = "區域編號"/);
  assert.match(app, /setMapReferenceLayerVisibility\(operationLeafletMap/);
  assert.doesNotMatch(app, /scenario\.(?:grid|zones)|spatialInventoryBefore\.(?:grid|zones)/);
});

test("round-resolution geographic animation stays inside its responsive layout", () => {
  assert.match(css, /\.operation-theater\s*\{[^}]*min-width:\s*0;[^}]*max-width:\s*100%/s);
  assert.match(css, /\.operation-theater-heading\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
  assert.match(css, /\.operation-leaflet-map\s*\{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*min-height:\s*0/s);
  assert.match(css, /\.operation-canvas-frame \.leaflet-control-container\s*\{\s*position:\s*static;/);
  assert.match(css, /#simulationMapSection \.operation-canvas-frame\s*\{[^}]*min-height:\s*clamp\(300px,\s*72vw,\s*420px\)/s);
});
