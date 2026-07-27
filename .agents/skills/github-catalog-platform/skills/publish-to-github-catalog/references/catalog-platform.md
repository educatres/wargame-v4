# Catalog Platform Reference

The catalog is a static Astro site deployed with GitHub Pages. Contributors add one YAML file per project under `catalog/`; GitHub Actions validates entries, fetches GitHub repository metadata, and builds the public site.

## Entry Schema

Required YAML fields:

```yaml
name: Project name
description: One concise paragraph for catalog readers.
authorName: Public author display name
authorGitHub: github-username
repo: owner/repository
homepage: https://optional.example.com/
tags:
  - ai
  - education
language: TypeScript
install: |
  Installation and setup instructions in Markdown-friendly plain text.
license: MIT
submittedAt: "2026-07-06"
```

Rules:

- `repo` must use `owner/name`.
- `tags` must contain 1 to 8 short tags.
- `homepage` may be blank.
- `install` may contain multiple lines.
- Do not include `stars`, `forks`, `repoUrl`, or `avatarUrl`; the build generates those fields.

## Platform Commands

Run these from the catalog repository root:

```bash
npm install
npm run new-entry
npm run validate:catalog
npm run enrich:catalog
npm run build
```

`enrich:catalog` uses `GITHUB_TOKEN` or `GH_TOKEN` when available. Without a token, GitHub API rate limits may be lower; failed requests fall back to zero stars so local builds can still complete.
