const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

test("standby is available to all three actors and in all quick-template groups", () => {
  const actionMatches = app.match(/\["待命不做事", \{\}\]/g) || [];
  const templateMatches = html.match(/data-order-template="(?:BLUE|RED|AMBER)"[^>]+>待命不做事<\/button>/g) || [];
  assert.equal(actionMatches.length, 3);
  assert.equal(templateMatches.length, 3);
});

test("standby normalization produces zero effort, no supports, and no allocations", () => {
  assert.match(app, /isStandbyAction\(primary\.action\)/);
  assert.match(app, /primary\.resource = 0/);
  assert.match(app, /supports: \[\]/);
  assert.match(app, /primary\.assetAllocations = \[\]/);
});

test("standby bypasses spatial targeting and inventory consumption", () => {
  assert.match(app, /if \(isStandbyAction\(item\.action\)\) return \[\]/);
  assert.match(app, /if \(isStandbyAction\(item\.action\)\) return;/);
  assert.match(app, /standby: "communications"/);
  assert.match(app, /type: "standby", combat: false/);
});
