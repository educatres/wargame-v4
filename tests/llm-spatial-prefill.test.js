const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("natural-language orders can select an allowed public landmark without sending coordinates to the LLM", () => {
  assert.match(app, /id: "TW-TAICHUNG-PORT"/);
  assert.match(app, /aliases: \["臺中港", "台中港"/);
  assert.match(app, /targetLandmarkId/);
  const promptStart = app.indexOf("function naturalOrderLlmPrompt");
  const promptEnd = app.indexOf("function naturalOrderQuantity", promptStart);
  const prompt = app.slice(promptStart, promptEnd);
  assert.match(prompt, /允許公開遊戲地標（不含座標）/);
  assert.doesNotMatch(prompt, /PUBLIC_GAME_TARGETS\.map\(target => \(\{\s*[^}]*lat/s);
});

test("LLM allocation suggestions are clamped to locally computed committable inventory", () => {
  assert.match(app, /committableSyntheticUnits: weaponRowMetrics\(row\)\.committable/);
  assert.match(app, /syntheticRangeBand: inventoryRangeBandForLlm\(row\)/);
  assert.match(app, /availableOriginZones: inventoryOriginZonesForLlm\(row\)/);
  assert.match(app, /preferredOriginZone/);
  assert.match(app, /rangeReason/);
  assert.match(app, /const recommendedLimit = Math\.min\(Math\.floor\(committable\), typicalUpper\)/);
  assert.match(app, /quantityReason/);
  assert.match(app, /const chineseNumberedModels = text\.match/);
});

test("target confirmation is prefilled and still exposes manual quantity adjustment", () => {
  assert.match(app, /if \(item\._spatialRequired\) autoSelectSpatialItem\(index, true\)/);
  assert.match(app, /class="spatial-allocation-quantity"/);
  assert.match(html, /確認發射／出發來源與攻擊／任務目標區域/);
  assert.match(app, /AUTO_SPATIAL_SOURCE_PLAN/);
  assert.match(app, /placementAllocations/);
  assert.match(app, /placementAllocations\.forEach\(source => \{\s*const result = SPATIAL\.consumePlacement/s);
});
