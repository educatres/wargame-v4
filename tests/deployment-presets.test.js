const test = require("node:test");
const assert = require("node:assert/strict");
const presets = require("../deployment-presets.js");

test("largest remainder allocation preserves the exact inventory total", () => {
  assert.deepEqual(presets.largestRemainder(10, 3), [4, 3, 3]);
  assert.equal(presets.largestRemainder(47, 6).reduce((sum, value) => sum + value, 0), 47);
});

test("KC46 resolves to the public-name preset and preserves quantity", () => {
  const placements = presets.placementsForRow({
    id: "KC46",
    actor: "AMBER",
    alias: "KC-46A Pegasus",
    category: "logistics",
    nominal: 18,
    placements: []
  }, { preserveExisting: false });
  assert.equal(placements.length, 1);
  assert.equal(placements[0].presetId, "AMBER-YOKOTA");
  assert.equal(placements[0].nominalQuantity, 18);
  assert.equal(placements[0].isLive, false);
});

test("existing user placements are never overwritten", () => {
  const existing = [{
    placementId: "USER-1",
    label: "自訂位置",
    lat: 23,
    lng: 121,
    nominalQuantity: 4,
    currentQuantity: 4,
    isUserModified: true
  }];
  const result = presets.placementsForRow({
    id: "F16",
    actor: "BLUE",
    alias: "F-16V",
    category: "aviation",
    nominal: 4,
    placements: existing
  });
  assert.equal(result, existing);
});

test("all physical actor-category combinations have a deterministic fallback", () => {
  const categories = ["aviation", "airDefense", "longRange", "maritime", "subsurface", "isr", "logistics", "airport", "radarStation", "base", "powerPlant", "position"];
  for (const actor of ["BLUE", "RED", "AMBER"]) {
    for (const category of categories) {
      const placements = presets.placementsForRow({
        id: `${actor}-${category}`,
        actor,
        alias: `${actor} ${category}`,
        category,
        nominal: 12,
        placements: []
      }, { preserveExisting: false });
      assert.ok(placements.length > 0, `${actor}/${category}`);
      assert.equal(placements.reduce((sum, item) => sum + item.nominalQuantity, 0), 12);
    }
  }
});
