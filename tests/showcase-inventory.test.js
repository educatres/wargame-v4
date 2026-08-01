const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function showcaseSource() {
  const start = app.indexOf("const SHOWCASE_INVENTORY_TEMPLATE");
  const end = app.indexOf("const STORM_STAGES", start);
  return app.slice(start, end);
}

test("showcase inventory offers five rows for each actor", () => {
  const source = showcaseSource();
  for (const actor of ["BLUE", "RED", "AMBER"]) {
    const rows = source.split("\n").filter(line => line.trim().startsWith(`["${actor}"`));
    assert.equal(rows.length, 5, `${actor} should have five showcase rows`);
  }
});

test("showcase inventory contains fighter, missile, Starlink, drone, and humanitarian examples", () => {
  const source = showcaseSource();
  assert.match(source, /F-16V Viper/);
  assert.match(source, /天弓三型防空飛彈/);
  assert.match(source, /殲-20戰鬥機／J-20/);
  assert.match(source, /東風-17常規導彈／DF-17/);
  assert.match(source, /Starlink 商用衛星通訊支援/);
  assert.match(source, /MQ-9A Reaper/);
  assert.match(source, /人道空運機/);
  assert.match(source, /人道救援直升機/);
});

test("showcase template has a dedicated loader without replacing the original template loader", () => {
  assert.match(html, /id="loadInventoryTemplateBtn"/);
  assert.match(html, /id="loadShowcaseInventoryTemplateBtn"[^>]*>載入展示用裝備範本</);
  assert.match(app, /renderDetailedInventoryRows\(showcaseInventoryTemplateRows\(\)\)/);
});
