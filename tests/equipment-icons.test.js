const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const bundledCatalog = fs.readFileSync(
  path.join(root, "taiwan_strait_wargame_icons", "catalog.js"),
  "utf8"
);
const manifest = JSON.parse(fs.readFileSync(
  path.join(root, "taiwan_strait_wargame_icons", "manifest.json"),
  "utf8"
));

test("equipment icon manifest contains valid SVG and GIF assets", () => {
  assert.equal(manifest.length, 48);
  manifest.forEach(entry => {
    assert.ok(["BLUE", "RED", "AMBER"].includes(entry.actor));
    assert.ok(entry.inventory_id);
    assert.ok(entry.alias);
    assert.ok(fs.existsSync(path.join(root, "taiwan_strait_wargame_icons", entry.svg_file)));
    assert.ok(fs.existsSync(path.join(root, "taiwan_strait_wargame_icons", entry.gif_file)));
  });
});

test("the 48-item icon catalog loads synchronously before the application", () => {
  assert.match(html, /taiwan_strait_wargame_icons\/catalog\.js[^]*app\.js/);
  assert.equal((bundledCatalog.match(/\binventory_id:/g) || []).length, 48);
  assert.match(app, /Array\.isArray\(window\.TAIWAN_STRAIT_WARGAME_ICONS\)/);
  assert.match(app, /if \(equipmentIconCatalog\.length\) \{[\s\S]*Promise\.resolve\(equipmentIconCatalog\)/);
  assert.match(app, /dataset\.equipmentIconMode = equipmentIconCatalog\.length \? "image-first" : "text-fallback"/);
});

test("LLM can only echo an icon ID attached to an allowed inventory item", () => {
  assert.match(app, /allowedIconId:\s*equipmentIconEntry\(row\)/);
  assert.match(app, /iconId 只能照所選 inventoryId 的 allowedIconId 原樣回傳/);
  assert.match(app, /equipmentIconEntry\(row, raw\?\.iconId\) \|\| equipmentIconEntry\(row\)/);
  assert.doesNotMatch(app, /允許圖標.*(?:svg_file|gif_file|preview_file)/);
});

test("map equipment markers prefer catalog images and retain text fallback", () => {
  assert.match(app, /function equipmentSpatialDivIcon\(/);
  assert.match(app, /onerror="this\.hidden=true;this\.nextElementSibling\.style\.display='grid';this\.nextElementSibling\.nextElementSibling\.hidden=true"/);
  assert.match(app, /return spatialDivIcon\(row\?\.actor \|\| "target", text, extraClass\)/);
  assert.match(app, /actionSpatialDivIcon\(action, rows, quantityLabel, "operation-moving-marker", true\)/);
  assert.match(css, /\.spatial-marker\.equipment-marker/);
  assert.match(css, /width:\s*20px;\s*height:\s*20px;[\s\S]*border-width:\s*3px/);
  assert.match(css, /\.equipment-marker\.operation-moving-marker\s*\{[\s\S]*width:\s*23px;[\s\S]*border-width:\s*4px/);
  assert.match(css, /\.equipment-marker-count\s*\{[\s\S]*font:\s*900 8px\/9px/);
});

test("round animation rebuilds equipment icons and actual quantities from the immutable turn ledger", () => {
  assert.match(app, /scene\?\.snapshot\?\.spatialInventoryBefore \|\| state\.scenario\?\.detailedInventory/);
  assert.match(app, /const ledgerAllocations = \(resourceLedger\?\.actionAllocations \|\| \[\]\)/);
  assert.match(app, /const effectiveAllocations = savedAllocations\.length[\s\S]*ledgerAllocations\.map/);
  assert.match(app, /function operationActionQuantityLabel\(action\)/);
  assert.match(app, /icon: actionSpatialDivIcon\(action, rows, quantityLabel\)/);
  assert.doesNotMatch(app, /icon: actionSpatialDivIcon\(action, rows, action\.primary \? "主" : "支"\)/);
});

test("three-faction icon guide reflects the current scenario inventory", () => {
  assert.match(app, /function operationLegendEquipmentIcon\(row\)/);
  assert.match(app, /const inventoryRows = \(state\.scenario\?\.detailedInventory \|\| \[\]\)\.map\(sanitizeInventoryRow\)/);
  assert.match(app, /inventoryRows\.filter\(row => row\.actor === actor\)\.map\(row =>/);
  assert.match(app, /INVENTORY_CATEGORIES\[row\.category\][\s\S]*目前 \$\{Math\.round\(row\.current\)\}/);
  assert.match(css, /\.operation-equipment-icon\s*\{/);
  assert.match(css, /\.spatial-marker\.equipment-marker\.BLUE\s*\{[^}]*background:\s*rgba\(207,\s*232,\s*255,\s*\.97\)/);
  assert.match(css, /\.spatial-marker\.equipment-marker\.RED\s*\{[^}]*background:\s*rgba\(255,\s*215,\s*212,\s*\.97\)/);
  assert.match(css, /\.operation-equipment-icon\.BLUE\s*\{[^}]*background:\s*#cfe8ff/);
  assert.match(css, /\.operation-equipment-icon\.RED\s*\{[^}]*background:\s*#ffd7d4/);
  assert.match(html, /目前想定品項、圖標與數量；預設隱藏/);
});
