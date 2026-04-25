# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Documentation First

**Before writing any code**, always check the `/docs` directory for relevant guides, specs, or conventions. If a `/docs` file covers the feature or area you are working on, read it first and follow its instructions. This applies to all code generation, edits, and refactors.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/routing.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.4** with the App Router (`src/app/`)
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)

## Architecture

This is a standard Next.js App Router project. All routes live under `src/app/` using file-system routing. `layout.tsx` is the root layout; `page.tsx` is the home route. Global styles are in `globals.css`.

Tailwind v4 config is handled through `postcss.config.mjs` — there is no `tailwind.config.*` file; configuration is done via CSS `@theme` directives in `globals.css` instead.
