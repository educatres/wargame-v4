import fs from "node:fs/promises";
import path from "node:path";
import { normalizeEntry, parseCatalogYaml } from "./catalog-schema.mjs";

const catalogDir = path.resolve("catalog");
const outputPath = path.resolve("src/data/catalog.generated.json");
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const strict = process.env.STRICT_GITHUB === "1";

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

async function readEntry(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return normalizeEntry(parseCatalogYaml(raw), path.relative(process.cwd(), filePath));
}

async function fetchRepo(repo) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "github-catalog-platform"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`https://api.github.com/repos/${repo}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${repo}`);
  }
  return response.json();
}

async function enrich(entry) {
  try {
    const repo = await fetchRepo(entry.repo);
    return {
      ...entry,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      lastPushedAt: repo.pushed_at ?? "",
      repoUrl: repo.html_url ?? `https://github.com/${entry.repo}`,
      avatarUrl: repo.owner?.avatar_url ?? ""
    };
  } catch (error) {
    if (strict) {
      throw new Error(`Repository metadata check failed for ${entry.repo}: ${error.message}`);
    }
    console.warn(`Using fallback metadata for ${entry.repo}: ${error.message}`);
    return {
      ...entry,
      stars: 0,
      forks: 0,
      lastPushedAt: "",
      repoUrl: `https://github.com/${entry.repo}`,
      avatarUrl: ""
    };
  }
}

const entries = await Promise.all((await listEntryFiles()).map(readEntry));
const enriched = await Promise.all(entries.map(enrich));

enriched.sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(enriched, null, 2)}\n`);
console.log(`Wrote ${enriched.length} enriched catalog entr${enriched.length === 1 ? "y" : "ies"} to ${outputPath}.`);
