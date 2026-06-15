# Routes

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
