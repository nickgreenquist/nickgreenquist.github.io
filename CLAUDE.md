# nickgreenquist.github.io

Personal portfolio site for Nick Greenquist — Astro + Tailwind, static, deployed to GitHub Pages via GitHub Actions. **Gateway model**: the home page is a hub of cards linking out (GitHub, LinkedIn, photography, wrestling, blog) rather than hosting everything inline. Live at `https://nickgreenquist.com/` (`nickgreenquist.github.io` redirects to it).

## Stack

- **Astro** static mode, TypeScript strict
- **Tailwind CSS v4** via `@tailwindcss/vite`; `@tailwindcss/typography` (`prose`) for blog bodies
- **Blog**: Astro content collection; markdown pipeline adds `remark-math` + `rehype-katex` and Shiki; `@astrojs/rss` feed at `/blog/feed.xml`
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

- `src/pages/` — `index.astro` (gateway), `projects.astro`, `education.astro`, `wrestling.astro`, `map.astro`, `contact.astro`; blog under `blog/` (`index.astro` listing, `[...slug].astro` route, `feed.xml.ts` RSS)
- `src/content/blog/*.md` — post bodies + frontmatter; schema in `src/content.config.ts`: `title`, `description`, `date` (`YYYY-MM-DD` string), `slug`, `category`, optional `image`
- `src/utils/blog.ts` — `postPath()`, `formatDate()`, `byNewest()`, `categoryLabel()`
- `src/layouts/Layout.astro` — global head, OG/Twitter meta (`ogType` prop → `article` for posts)
- `src/components/` — GatewayCard, ProjectCard, JourneyTimeline, PhotoGrid, EducationSection, SkillsSection, Gallery
- `src/data/` — `about.ts` (bio + journey timeline), `courses.json`, `skills.ts`, `projects.ts`, `photography.ts`
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

> [!IMPORTANT]
> **Don't delete the old Jekyll blog repo** (`github.com/nickgreenquist/blog`). Its Pages was disabled June 2026 so this site's `/blog/` could own the domain (cutover complete). Its git history is the only copy of ~10 unpublished ML posts. Archive it if you want — never delete.

## Rollback

`v1-final` tag preserves the pre-rewrite v1 site: `git reset --hard v1-final && git push origin master --force-with-lease`.

## Future work

- **Update `public/Resume.pdf`** — still the v1 file.
- **Republish the unpublished ML "from-scratch" series** (low priority) — 12 posts recovered into `drafts/` (outside the content collection, so invisible to the build) in original Jekyll/kramdown form. To publish: convert Jekyll-isms (Liquid URLs, kramdown img attrs, MathJax→KaTeX `aligned`), add frontmatter, move to `src/content/blog/`, copy assets to `public/blog/assets/`. See `drafts/README.md`.
