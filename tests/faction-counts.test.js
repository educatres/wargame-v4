const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("faction count tables use committed turn-ledger quantities instead of command points", () => {
  assert.match(app, /log\.resourceLedger\?\.actionAllocations/);
  assert.match(app, /formatTimelineQuantity\(entry\.committed, language\.unit\)/);
  assert.match(app, /本回合實際數量（合成）/);
  const start = app.indexOf("function renderFactionCountTable");
  const end = app.indexOf("function renderTurnFactionCountTables", start);
  assert.doesNotMatch(app.slice(start, end), /row\.resource/);
});

test("synthetic quantities use readable action verbs and equipment units", () => {
  assert.match(app, /return \{ verb: "出動", unit: "架次" \}/);
  assert.match(app, /return \{ verb: "發射", unit: "枚" \}/);
  assert.match(app, /return \{ verb: "投入", unit: "艘" \}/);
  assert.match(app, /return \{ verb: "投入", unit: "批" \}/);
  assert.match(app, /return \{ verb: "啟用", unit: "節點" \}/);
  assert.match(app, /TIMELINE_INTEGER_UNITS = new Set\(\["架次", "枚", "艘", "批", "節點", "處"\]\)/);
  assert.match(app, /if \(TIMELINE_INTEGER_UNITS\.has\(unit\)\) \{\s*return String\(Math\.round\(numeric\)\);/);
  assert.match(html, /數量顯示本回合實際扣帳/);
});

test("discrete quantities are normalized before resource adjudication is recorded", () => {
  assert.match(app, /const inventoryQuantity = \(category, value, mode = "round"\) => SPATIAL\.normalizeQuantity/);
  assert.match(app, /requested: inventoryQuantity\(row\.category, allocation\.quantity\), committed: inventoryQuantity\(row\.category, used\)/);
  assert.match(app, /entry\.actionConsumption = inventoryQuantity\(row\.category, entry\.actionConsumption\)/);
  assert.match(app, /entry\.eventLoss = inventoryQuantity\(row\.category, entry\.eventLoss\)/);
});

test("legacy turns are clearly labeled as planned rather than actual counts", () => {
  assert.match(app, /計畫\$\{language\.verb\}/);
  assert.match(app, /舊回合無實際扣帳/);
});
