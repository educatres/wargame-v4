import catalog from "../data/catalog.generated.json";

export type CatalogEntry = {
  name: string;
  description: string;
  authorName: string;
  authorGitHub: string;
  repo: string;
  homepage: string;
  tags: string[];
  language: string;
  install: string;
  license: string;
  submittedAt: string;
  sourcePath: string;
  stars: number;
  forks: number;
  lastPushedAt: string;
  repoUrl: string;
  avatarUrl: string;
};

export const entries = catalog as CatalogEntry[];

export const languages = Array.from(new Set(entries.map((entry) => entry.language))).sort((a, b) =>
  a.localeCompare(b)
);

export const tags = Array.from(new Set(entries.flatMap((entry) => entry.tags))).sort((a, b) =>
  a.localeCompare(b)
);
