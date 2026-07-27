import fs from "node:fs/promises";
import path from "node:path";
import { normalizeEntry, parseCatalogYaml } from "./catalog-schema.mjs";

const catalogDir = path.resolve("catalog");

async function listEntryFiles() {
  try {
    const names = await fs.readdir(catalogDir);
    return names
      .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
      .sort()
      .map((name) => path.join(catalogDir, name));
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function validateFile(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const data = parseCatalogYaml(raw);
  return normalizeEntry(data, path.relative(process.cwd(), filePath));
}

const files = await listEntryFiles();
const repos = new Set();
const errors = [];

for (const file of files) {
  try {
    const entry = await validateFile(file);
    if (repos.has(entry.repo)) {
      errors.push(`${file}: duplicate repo "${entry.repo}"`);
    }
    repos.add(entry.repo);
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error("Catalog validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog validation passed for ${files.length} entr${files.length === 1 ? "y" : "ies"}.`);
