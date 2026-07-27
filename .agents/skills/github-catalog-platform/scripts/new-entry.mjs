import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { normalizeEntry, stringifyCatalogYaml } from "./catalog-schema.mjs";

const rl = readline.createInterface({ input, output });

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ask(label, fallback = "") {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = (await rl.question(`${label}${suffix}: `)).trim();
  return answer || fallback;
}

try {
  const name = await ask("Project name");
  const entry = {
    name,
    description: await ask("Short description"),
    authorName: await ask("Author display name"),
    authorGitHub: await ask("GitHub username"),
    repo: await ask("Repository (owner/name)"),
    homepage: await ask("Homepage URL, leave blank if none"),
    tags: (await ask("Tags, comma separated", "tool, learning"))
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    language: await ask("Primary language or framework"),
    install: await ask("Install instructions"),
    license: await ask("License", "MIT"),
    submittedAt: await ask("Submitted date", new Date().toISOString().slice(0, 10))
  };

  normalizeEntry(entry, "interactive input");

  const fileName = `${slugify(name || entry.repo)}.yaml`;
  const filePath = path.join("catalog", fileName);
  await fs.mkdir("catalog", { recursive: true });
  await fs.writeFile(filePath, stringifyCatalogYaml(entry), { flag: "wx" });
  console.log(`Created ${filePath}`);
} finally {
  rl.close();
}
