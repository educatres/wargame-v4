---
name: publish-to-github-catalog
description: Guide users through publishing a software project to their own GitHub account and submitting it to a public GitHub Pages software catalog. Use when users want help creating or logging into GitHub, authenticating with GitHub CLI, initializing git, creating a GitHub repository, pushing code, preparing README/install/license metadata, opening a catalog Pull Request, or maintaining a GitHub Stars-based public software directory.
---

# Publish To GitHub Catalog

## Overview

Use this skill to help a learner or developer publish a project to GitHub and submit it to a shared software catalog. Keep the conversation in Traditional Chinese unless the user requests another language.

Never ask the user to reveal a password, token, recovery code, or 2FA code. Use GitHub CLI browser/device login or direct the user to GitHub-owned pages for account creation and authentication.

## Workflow

1. Confirm the project folder and whether the user already has a GitHub account.
2. Check local tools with `git --version` and `gh --version`.
3. Authenticate GitHub CLI with `gh auth status`; if needed, guide the user through `gh auth login`.
4. Prepare the project for public release.
5. Create or connect a GitHub repository and push the project.
6. Create a catalog entry with the platform helper script.
7. Open a Pull Request to the catalog repository.

Read `references/catalog-platform.md` when the user is submitting to the catalog project bundled with this skill or when you need the catalog YAML schema.

## Account And Authentication

If the user has no GitHub account, direct them to create one at `https://github.com/signup` in their browser. After they confirm the account exists, continue with GitHub CLI login.

Prefer this login path:

```bash
gh auth status
gh auth login
```

Ask the user to complete the browser/device flow themselves. If `gh` is missing, help install GitHub CLI using the user's OS package manager, or fall back to GitHub's web UI instructions for creating a repository and uploading/pushing code.

## Publish The Project

Before publishing, inspect the project and make the public repo useful:

- Ensure there is a `README.md` with project purpose, requirements, installation, usage, and screenshots if available.
- Add or confirm a license file when the user wants the work to be reusable.
- Add a `.gitignore` appropriate to the stack before the first commit.
- Avoid committing secrets, `.env` files, credentials, build caches, private datasets, or generated dependency folders.

Use these commands when appropriate:

```bash
git status
git init
git add .
git commit -m "Initial public release"
gh repo create <repo-name> --public --source . --remote origin --push
```

If the folder is already a git repository, preserve existing history and remotes. Use `git remote -v` and `gh repo view` to understand the current state before changing remotes.

## Submit To Catalog

Use the catalog project's helper first:

```bash
npm run new-entry
npm run validate:catalog
```

The entry must describe the published GitHub repository, not a local-only folder. Stars are not entered manually; the catalog platform fetches them from GitHub using the repository API during build.

After the entry is valid, create a branch and PR:

```bash
git checkout -b add-<project-slug>
git add catalog/<project-slug>.yaml
git commit -m "Add <project-name> to catalog"
git push -u origin add-<project-slug>
gh pr create --fill
```

If the user is contributing from a fork, use GitHub's fork workflow and open the PR back to the central catalog repository.

## Completion Checklist

Finish only after these are true:

- The user's project is visible in a public GitHub repository.
- The repository README explains what the project does and how to install or run it.
- The catalog YAML validates locally.
- A Pull Request exists, or the user has the exact final web steps needed to open one.
- The user understands GitHub Stars will appear after the catalog build fetches repository metadata.
