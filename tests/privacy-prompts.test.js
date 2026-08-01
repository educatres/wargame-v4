const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

test("LLM order context always uses the coordinate-free sanitizer", () => {
  const submittedOrderLines = source.split(/\r?\n/).filter(line => line.includes("已提交命令："));
  assert.ok(submittedOrderLines.length >= 2);
  submittedOrderLines.forEach(line => assert.match(line, /sanitizedOrdersForLlm/));
  assert.doesNotMatch(source, /currentOrders:\s*state\.orders/);
});

test("the LLM inventory projection excludes spatial fields", () => {
  const start = source.indexOf("function actorInventoryForLlm");
  const end = source.indexOf("function naturalOrderLlmPrompt", start);
  const projection = source.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.doesNotMatch(projection, /\b(lat|lng|placements|placementId|gameRangeKm|presetId|sourceUrl|sourceCheckedAt|precision)\b/);
});

test("adjudication prompts use the coordinate-free adjudication projection", () => {
  const start = source.indexOf("function adjudicationNarrativePrompt");
  const end = source.indexOf("async function generateLlmAdjudicationNarrative", start);
  const promptSource = source.slice(start, end);
  assert.match(promptSource, /sanitizedAdjudicationForLlm\(log\.adjudication\)/);
  assert.doesNotMatch(promptSource, /JSON\.stringify\(log\.adjudication\)/);
  const sanitizerStart = source.indexOf("function sanitizedAdjudicationForLlm");
  const sanitizer = source.slice(sanitizerStart, end);
  assert.doesNotMatch(sanitizer, /\btarget\s*:/);
});
