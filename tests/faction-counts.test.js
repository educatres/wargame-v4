const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("faction count tables use committed turn-ledger quantities instead of command points", () => {
  assert.match(app, /log\.resourceLedger\?\.actionAllocations/);
  assert.match(app, /formatTimelineQuantity\(entry\.committed\)/);
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
  assert.match(html, /數量顯示本回合實際扣帳/);
});

test("legacy turns are clearly labeled as planned rather than actual counts", () => {
  assert.match(app, /計畫\$\{language\.verb\}/);
  assert.match(app, /舊回合無實際扣帳/);
});
