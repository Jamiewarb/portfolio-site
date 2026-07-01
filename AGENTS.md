# Agents

This repository is a portfolio website for Jamie Warburton, built in Astro and hosted on Netlify. Some of the Astro islands may use React. The following conventions should be followed when contributing code or updating documentation.

## Repository Overview

```
portfolio-site/
├── .github/workflows/   # CI — hourly likes sync to git
├── public/              # Static files copied as-is (favicons, robots.txt)
├── scripts/             # CLI scripts (e.g. sync-likes.ts)
├── src/
│   ├── assets/          # Images and local fonts (Stolzl)
│   ├── components/      # Reusable Astro components; React under likes/
│   ├── config/          # Site metadata (title, descriptions, OG defaults)
│   ├── constants/       # Shared constants — especially routes.ts
│   ├── content/         # Git submodule → portfolio-content (writing posts)
│   ├── data/            # Build-time JSON (likes.json)
│   ├── helpers/         # Small shared utilities (e.g. datetime)
│   ├── layouts/         # BaseLayout, BlogPost
│   ├── lib/             # Business logic (blog, seo, likes, hooks)
│   ├── pages/           # File-based routing and API endpoints
│   └── styles/          # Global CSS and Tailwind entry
├── astro.config.mjs
├── src/content.config.ts  # Content collection schema (blog)
└── package.json
```

### Content

Writing lives in a **git submodule** at `src/content/` (repo: `portfolio-content`). Posts are loaded via the `blog` collection defined in `src/content.config.ts` from `src/content/writing/`. Each post requires a `postId` in frontmatter (used by the likes system).

### Likes system

Two data sources work together:

1. **Runtime** — `src/pages/api/likes/[postId].ts` reads/writes counts in Upstash Redis via `src/lib/likes/`.
2. **Build-time** — `src/data/likes.json` provides counts for static rendering (e.g. `PostHeartCounter.astro` on the homepage).

A GitHub Actions workflow (`.github/workflows/sync-likes.yml`) runs `pnpm sync:likes` hourly to pull Redis counts into `likes.json` and commit the result.

### Config files

`astro.config.mjs` - Astro integrations (MDX, React, sitemap, Netlify), fonts, markdown plugins
`src/config/.` - Application configuration
`src/constants/.` - All constants defined here across the app

## Routes

All website pages are statically generated. API routes under `src/pages/api/` run as Netlify serverless functions at runtime.

### Linking to Routes

All `<a href>` values come from `src/constants/routes.ts` — never hardcode paths in components or pages.

```ts
import { ROUTES } from '../constants/routes';

<a href={ROUTES.home}>Home</a>
<a href={ROUTES.writingPost(slug)}>{title}</a>
<a href={ROUTES.external.github}>GitHub</a>
```

- Static paths: `ROUTES.writing`, `ROUTES.me`, etc.
- Dynamic paths: `ROUTES.writingPost(slug)` for `[...slug]` pages under `src/pages/writing/`
- External links: `ROUTES.external.*`
- New routes: add to `ROUTES` first, then use it everywhere

File-based routing lives in `src/pages/`. Keep `ROUTES` in sync when adding or renaming pages.

## Coding Convention

Components are exported as named functions, NOT as default exports:

```
export function MyComponent() {
  return <div />;
}
```

### CSS and responsive layout

- Write **mobile-first** styles. Do not use `max-width` media queries or Tailwind `max-*` variants for layout.
- In `.css` files and Astro `<style>` blocks, use Tailwind **`@variant`** for breakpoints (e.g. `@variant md { ... }`). Add `@reference "../styles/global.css"` (adjust path as needed) in Astro `<style>` tags so `@variant` resolves.
- Prefer intrinsic wrapping (`flex-wrap`, `min-width: min(100%, max-content)`, etc.) over fixed breakpoints when layout should respond to available space.

## Testing

When implementing features ensure you test them with the following:

- Linting `pnpm lint`
- The build `pnpm build`
- The functionality
 - For frontend, test via `pnpm dev` to run a local instance, then open it in a browser and test your feature
 - For API or backend, you may need to think about how best to test it, such as using the CLI to send a request to the API, or logging within the service to a log output file to then grep, etc. You decide but you must test your work

Ensure you iterate until you're happy with the success of your code.