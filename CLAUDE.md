# nickgreenquist.github.io

Personal portfolio site for Nick Greenquist — Astro + Tailwind, static, deployed to GitHub Pages via GitHub Actions. **Single-scroll home**: `index.astro` is one identity-first page (hero → about/journey → recommender cards → featured posts → publications → photography → personal → links tail); deep dives live on subpages. Live at `https://nickgreenquist.com/` (`nickgreenquist.github.io` redirects to it). Remaining polish backlog: `docs/portfolio-improvements.md`.

## Stack

- **Astro** static mode, TypeScript strict
- **Tailwind CSS v4** via `@tailwindcss/vite`; `@tailwindcss/typography` (`prose`) for blog bodies
- **Dark mode**: `.dark` on `<html>` remaps the `neutral-*`/`white` CSS vars in `global.css` (toggle + pre-paint script in `Layout.astro`) — new UI must use `neutral-*`/`white` utilities, never hardcoded hex or literal `text-white`, or it won't theme.
- **Blog**: Astro content collection; markdown pipeline adds `remark-math` + `rehype-katex` and Shiki (dual light/dark themes); `@astrojs/rss` feed at `/blog/feed.xml`; `@astrojs/sitemap`
- **Contact form**: Formspree `https://formspree.io/f/maqvayqy`
- **Deploy**: GitHub Actions (`.github/workflows/deploy.yml`), Node 22 (Astro needs `>=22.12.0`)

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces dist/
npm run preview  # serves built dist/
```

## Structure

- `src/pages/` — `index.astro` (single-scroll home), `projects.astro`, `education.astro`, `wrestling.astro`, `map.astro`, `contact.astro`; blog under `blog/` (`index.astro` listing, `[...slug].astro` route, `feed.xml.ts` RSS)
- `src/content/blog/*.md` — post bodies + frontmatter; schema in `src/content.config.ts`: `title`, `description`, `date` (`YYYY-MM-DD` string), `slug`, `category`, optional `image`
- `src/utils/blog.ts` — `postPath()`, `formatDate()`, `byNewest()`, `categoryLabel()`
- `src/layouts/Layout.astro` — global head, OG/Twitter meta (`ogType` prop → `article` for posts)
- `src/components/` — GatewayCard, RecommenderCard, ProjectCard, JourneyTimeline, PhotoGrid, EducationSection, Gallery
- `src/data/` — `about.ts` (bio + journey timeline), `courses.json`, `links.ts`, `projects.ts`, `photography.ts`
- `src/assets/` — images optimized through `astro:assets` (auto WebP at build)
- `public/` — served verbatim at stable URLs: `Resume.pdf`, OG/social images, favicons, and `blog/` (see below)

## Deployment gotcha

GitHub Pages **Source must stay "GitHub Actions"** (Settings → Pages), not "Deploy from a branch" — Astro needs the build step. Every push to `master` builds and publishes `dist/`.

## Blog

Two `blog` dirs with opposite build roots — **don't consolidate**:
- `src/content/blog/` — post bodies, **processed** (collection schema, KaTeX/Shiki, routed by `[...slug].astro`, fed to listing + RSS).
- `public/blog/` — served **verbatim** at stable URLs: post images under `assets/` (referenced by absolute `/blog/assets/...`, NOT `astro:assets`) and old Jekyll `.html` redirect stubs.

URLs preserved from Jekyll: `/blog/<category>/<yyyy>/<mm>/<dd>/<slug>/` — categories lowercase; `slug` keeps original casing, so it's explicit in frontmatter. Add a post: drop a `.md` in `src/content/blog/` with the frontmatter schema — listing, route, RSS, and URL all derive automatically.

**Authoring gotchas:**
- Escape literal `$` → `\$` in prose, or `remark-math` parses `$…$` as KaTeX and breaks the build. Don't escape real math.
- Porting a project's `docs/*.md` (precedent: `llm-vs-genome-content-features` from the Two-Tower repo): add frontmatter, drop the source H1 (route renders `title` as the `<h1>`), copy figures to `public/blog/assets/<Dir>/` and rewrite image paths to absolute `/blog/assets/<Dir>/...`. Verify with `npm run build`.

**Interactive widgets in a post.** `completing-the-tcg-pokedex` is the first post that ships
its own JS: a 69-page binder flipbook. Its CSS/JS and the vendored StPageFlip runtime live in
`public/blog/assets/PokedexBinder/` (see the `README.md` there for why it is plain HTML rather
than React) and are edited in place. Shared figure styles for the post (`page-pair`) are in
`src/styles/global.css` alongside `poster-row`, not inline in the post.

The 69 page images are the one part of that post needing a build step: `binder_photos/`
holds ~800 MB of full-resolution shots (gitignored, and the only copy — never delete it), and
`scripts/build_binder_assets.mjs` encodes them into `public/blog/assets/PokedexBinder/`.
It uses `sharp`, which Astro already provides, so no extra install. Only run it if the photos
change. `scripts/build_binder_rules_figure.mjs` builds the one annotated figure (the pages
10/11 spread marked up to show the energy-leader and fresh-page rules) by compositing an SVG
overlay onto the already-encoded `page-10.webp`/`page-11.webp` — it never touches the source
photos, so it is safe to re-run. `scripts/build_dex_list_figure.mjs` builds the Bulbapedia
regional-forms figure and takes a screenshot path as its argument (see its header for how that
screenshot is captured); its output is committed, so it only needs re-running if the figure changes. `scripts/test_binder_flipbook.mjs` is a 30-check Playwright suite for the widget;
Playwright is deliberately **not** in `package.json` (its postinstall downloads browsers,
which would run on every CI deploy), so install it ad hoc when you want to run it:
`npm i --no-save playwright && npx playwright install chromium`.

> [!IMPORTANT]
> **Don't delete the old Jekyll blog repo** (`github.com/nickgreenquist/blog`). Its Pages was disabled June 2026 so this site's `/blog/` could own the domain (cutover complete). Its git history is the only copy of ~10 unpublished ML posts. Archive it if you want — never delete.

## Rollback

`v1-final` tag preserves the pre-rewrite v1 site: `git reset --hard v1-final && git push origin master --force-with-lease`.

## Future work

- **Update `public/Resume.pdf`** — still the v1 file.
- **Republish the unpublished ML "from-scratch" series** (low priority) — 12 posts recovered into `drafts/` (outside the content collection, so invisible to the build) in original Jekyll/kramdown form. To publish: convert Jekyll-isms (Liquid URLs, kramdown img attrs, MathJax→KaTeX `aligned`), add frontmatter, move to `src/content/blog/`, copy assets to `public/blog/assets/`. See `drafts/README.md`.
