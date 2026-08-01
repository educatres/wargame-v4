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
  assert.match(app, /SPATIAL\.ZONE_CENTERS\[item\.zone\]/);
  assert.match(app, /allocation\.placementId = eligible\[0\]\.placement\.placementId/);
  assert.match(app, /function autoSelectAllSpatialItems/);
  assert.match(html, /id="autoSelectSpatialOrderBtn"/);
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
