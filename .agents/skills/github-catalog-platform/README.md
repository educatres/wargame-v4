# GitHub 作品清單平台

這個專案包含兩個部分：

- `skills/publish-to-github-catalog/`：Codex agent skill，引導使用者建立或登入 GitHub、發布自己的程式作品、提交作品登錄 PR。
- Astro 靜態網站：讀取 `catalog/*.yaml`，顯示作品描述、安裝方法、作者 GitHub、原始碼連結與 GitHub Stars。

## 本機使用

```bash
npm install
npm run validate:catalog
npm run enrich:catalog
npm run dev
```

新增作品：

```bash
npm run new-entry
npm run validate:catalog
```

## Catalog YAML

每個作品放在 `catalog/<slug>.yaml`：

```yaml
name: My Project
description: A short description for readers.
authorName: Your Name
authorGitHub: your-github-name
repo: your-github-name/my-project
homepage: ""
tags:
  - tool
  - education
language: TypeScript
install: |
  npm install
  npm run dev
license: MIT
submittedAt: "2026-07-06"
```

Stars 由 `scripts/enrich-catalog.mjs` 從 GitHub repository API 取得，不需要投稿者填寫。
本機無法連線 GitHub API 時會以 0 stars fallback；CI 會設定 `STRICT_GITHUB=1`，因此 repository 不存在、非公開或 API 讀取失敗時會擋下 PR。

## GitHub Pages

1. 將此專案推到 GitHub repository。
2. 到 repository settings 啟用 Pages，source 選 GitHub Actions。
3. 設定 repository variables：
   - `SITE_URL`：例如 `https://<owner>.github.io`
   - `SITE_BASE`：若部署到 project page，填 `/<repo-name>/`；若是 user/org page，填 `/`。
4. Push 到 `main` 後，`.github/workflows/pages.yml` 會建置並部署網站。

## Skill 安裝

將 `skills/publish-to-github-catalog` 複製到你的 Codex skills 目錄，例如：

```bash
cp -R skills/publish-to-github-catalog ~/.codex/skills/
```

之後可用 `$publish-to-github-catalog` 觸發。
