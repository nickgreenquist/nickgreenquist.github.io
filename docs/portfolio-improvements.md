# Portfolio Improvements — Research & Work Plan

> Compiled 2026-06-11. Based on a firsthand read of the current site (every page + `Layout.astro` + `src/data/*`) and ~40 real industry portfolios read across 5 lenses: SWE structure, ML/AI-engineer sites, visual/interaction craft, content/IA, and technical polish.

**Framing:** The site has already outgrown the "gateway/hub of cards" model still described in `CLAUDE.md`. `index.astro` is now a single-scroll, identity-first page (Hero → About + journey → metric-driven project cards w/ live demos → curated blog → publications → photography → personal → links-as-tail). That was the #1 redesign three of five agents independently recommended — **already done.** What follows is polish + a few high-ROI additions, **not** a redesign.

> TODO: update `CLAUDE.md` — it still calls the home page a "gateway model / hub of cards linking out." It's now a single-scroll page.

---

## TL;DR — ranked shortlist (do these first)

- [x] **1. Dark mode + delightful toggle** — `ADD` · effort M · the one thing every standout has that we don't; the toggle transition is itself a craft signal — **DONE** (`.dark` remaps neutral/white CSS vars in `global.css`; View-Transitions circular-reveal toggle + no-FOUC pre-paint in `Layout.astro`; dual Shiki themes; `dark:prose-invert`)
- [x] **2. JSON-LD `Person` schema** in `Layout.astro` — `ADD` · effort XS · highest-ROI SEO win across all 40 sites (only leerob.com had it) — **DONE** (sitewide `Person` schema; `sameAs` derived from `src/data/links.ts` — GitHub, LinkedIn, Instagram, photography portfolio, Scholar, Goodreads)
- [ ] **3. `@astrojs/sitemap` + RSS `<link rel="alternate">` in `<head>`** — `ADD` · effort XS · free SEO + feed autodiscovery
- [ ] **4. Subtle motion: spring hover-lifts + scroll-reveal** — `ADD` · effort S · cheapest "clean → alive" lever; gate behind `prefers-reduced-motion`
- [ ] **5. Update `public/Resume.pdf`** (still v1) — `MODIFY` · effort S · portfolio's #1 conversion asset
- [ ] **6. `/uses` page** (dev setup + camera gear) — `ADD` · effort S · on-brand (engineer + photographer), evergreen
- [ ] **7. Skip-to-content link + hidden `console.log` greeting** — `ADD` · effort XS · one a11y fix, one dev easter egg

---

## What the site already nails (leave alone)

The research kept "discovering" things already done — named here so generic advice doesn't talk us out of them:

- **Single-scroll, identity-first home** with the link-grid demoted to a tail "Links" section.
- **Metric-driven, deployed project cards** — the four recommenders each show dataset/scale + a hard result (8.7× MRR, +16% NDCG@10) + **live Streamlit demo + GitHub**. The ML agent's #1 differentiator ("copy Eugene Yan's deployed-demo gallery") — already here. Don't dilute.
- **No skill bars.** `skills.ts` is flat labeled tag groups. Every agent called skill-% bars the #1 template tell to avoid.
- **Real narrative journey timeline** (lifeguard → RIT/wrestling → internships → NYU → Google → Dad).
- **Curated writing on home** (2 latest + "See all"), category filters w/ counts on `/blog`, working RSS, KaTeX/Shiki.
- **Genuine personality** ("Away from the Keyboard": new dad, travel, fitness, Goodreads, live Pokémon tracker) — most engineer sites lack this.
- **Real publications** (3 IEEE/Springer papers) placed *below* the work as a card list + Scholar link — correct placement. Keep (we're framed as industry SWE who also published, not an academic).
- **Solid meta baseline**: canonical, OG, `twitter:summary_large_image`, responsive `astro:assets` WebP, Astro's zero-JS HTML → near-perfect CWV.

---

## Cross-cutting patterns from the ~40 sites

1. **Hero = identity in one line + optional mission line.** Role + current company + one verb-driven sentence about what you build. (Our `bioIntro` — "building and scaling the recommender systems that help billions of Android users discover their next favorite app" — already *is* this; it just lives in the About paragraph, not the hero.)
2. **Current role @ named company = #1 seniority signal; tenure/scale numbers = #2.** First viewport.
3. **Blog/writing is a first-class pillar** for ML folks; standouts curate a "Start Here" of 3–5 best pieces.
4. **Deployed demos >>> repo links.** (We're here.)
5. **One signature visual move, not five.**
6. **Dark mode is table-stakes; the toggle is a deliberate delight.**
7. **Restraint reads as senior** (Rauno/Paco/Delba). Matches our aesthetic.
8. **Recency signals everywhere** — dates, "now" content, fresh demos. (→ v1 résumé is the staleness risk.)
9. **Technical hygiene the field half-ignores**: JSON-LD `Person`, sitemap, per-page OG, skip-links, `prefers-reduced-motion`.

---

## Standout sites & the one thing to steal

| Site | Steal this |
|------|-----------|
| leerob.com | JSON-LD `Person` w/ `sameAs[]`; one-line identity + mission |
| eugeneyan.com/prototyping | Deployed-demo gallery (desc + live link + GitHub + clip) — *we already do this* |
| antfu.me | View-Transitions **circular dark-mode reveal**; `/uses` page |
| joshwcomeau.com | Spring micro-interactions; dark+sound toggles; reduced-motion whimsy |
| rauno.me | Restraint-as-craft; copy "Copied" feedback; considered hover transitions |
| jalammar.github.io | Custom **figures/diagrams as content** in technical posts |
| maximeheckel.com | Interactive in-article widgets + reading-progress bar |
| simonwillison.net | Date *everything*; visible "ships constantly" cadence |
| brittanychiang.com | Experience timeline w/ per-role tech tags; skip-to-content link |
| wesbos.com / sivers.org | `/uses` and `/now` conventions |

---

## ADD

### Tier 1 — high impact, low effort
- [x] **Dark mode + signature toggle.** Tailwind v4 `@custom-variant dark` + CSS variables + inline pre-paint script (set class before first paint → no FOUC/CLS). Make the toggle the delight: antfu-style circular `clip-path` reveal via `document.startViewTransition` (Astro `<ClientRouter/>`). Gate behind `prefers-reduced-motion`. *This is our "one signature move."* — **DONE.** Implemented via a `.dark` neutral/white CSS-var remap (no per-element `dark:` churn); `startViewTransition` runs without `<ClientRouter/>` (same-document toggle).
- [x] **JSON-LD `Person` schema** in `Layout.astro` (see appendix). — **DONE** (LinkedIn + other `sameAs` URLs sourced from `src/data/links.ts`, resolving the appendix TODO).
- [ ] **`@astrojs/sitemap`** integration + **`<link rel="alternate" type="application/rss+xml" href="/blog/feed.xml">`** in `<head>` + `public/robots.txt` pointing at the sitemap.
- [ ] **Skip-to-content link** (`<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>` + `id="main"` on `<main>`).
- [ ] **Hidden `console.log` greeting** (styled message + "code's on GitHub →").

### Tier 2 — medium effort, real polish
- [ ] **Motion pass.** Spring/eased hover-lift + slight scale on project/blog cards (extend existing `hover:shadow-md`); small `translateY(12px)→0` + opacity scroll-reveals per `<section>` (CSS `animation-timeline: view()` + IntersectionObserver fallback). Distances small, durations <400ms, all behind `prefers-reduced-motion`.
- [ ] **`/uses` page** — dev setup + camera/photography gear. List on uses.tech for a backlink.
- [ ] **Per-page OG images for blog posts.** Verify `[...slug].astro` passes each post's frontmatter `image` to Layout's `ogImage` prop — otherwise every shared blog link falls back to `/me-og.jpg`. Wire it through, or generate per-post OG cards at build (Satori/`@vercel/og`).
- [ ] **Mono accent font** for dates/tags/code metadata (currently all-sans).

### Tier 3 — optional / only if enjoyable
- [ ] **Reading-progress bar** on blog posts (scoped island).
- [ ] **One interactive explainer** in a future ML post (Astro island viz, à la Jay Alammar) — highest ceiling, real effort, pick one post.
- [ ] **`/now` page** — *optional*; "Away from the Keyboard" already covers most of a /now. Add only for the canonical single-snapshot URL.
- [ ] **GitHub stats/contribution strip** — only if a repo has traction; build-time fetch (don't client-fetch → CWV). Project-card metrics already serve as the proof strip, so low priority.

---

## MODIFY

- [ ] **Update `public/Resume.pdf`** (v1) and link it more prominently (hero or sticky nav), not just the menu.
- [ ] **Hero subhead.** "`Senior Software Engineer @ Google · Machine Learning · Recommender Systems`" is a credential stack. The `bioIntro` sentence is the real hook — promote a punchy version into/next to the hero so the verb-driven line lands in 2 seconds. Small edit.
- [ ] **Reconsider the hamburger on desktop.** Keep key destinations (Blog · Projects · Resume · Contact) visible in the top bar; keep hamburger on mobile. The one IA choice that runs against the grain of the sites read. Low priority.

---

## STRIP / don't bother

- WebGL / 3D / drivable-world heroes — heavy, hurts CWV/a11y, reads as "creative-dev cosplay" for an ML engineer.
- Custom global cursor, smooth-scroll hijacking (Lenis/Locomotive), typewriter/rotating titles, preloader gates, parallax-everything — gimmicks that fight the OS and read junior.
- Guestbooks & public visitor counters — decay + spam (leerob retired his). Use privacy-respecting analytics (Plausible/Vercel) if numbers are wanted.
- Command palette (⌘K) — lovely but ~zero utility on a ~7-page site; **defer**.
- Skill bars, "passionate developer" filler, tech-logo soup — already avoided; keep avoiding.

---

## Suggested order (a focused weekend)

1. **Sat AM (mechanical):** JSON-LD, sitemap, RSS head link, robots.txt, skip-link, console egg → ship. Big SEO/credibility jump for ~2h.
2. **Sat PM (marquee):** dark mode + CSS-variable theming + View-Transitions toggle reveal → the visible "wow."
3. **Sun:** motion pass (spring hovers + scroll-reveals), mono accent, update `Resume.pdf`, draft `/uses`.

---

## Appendix — implementation sketches (Tier 1)

### JSON-LD `Person` (drop into `Layout.astro` `<head>`)
```html
<script type="application/ld+json" set:html={JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Nick Greenquist",
  "url": "https://nickgreenquist.com",
  "image": "https://nickgreenquist.com/me-og.jpg",
  "jobTitle": "Senior Software Engineer",
  "worksFor": { "@type": "Organization", "name": "Google" },
  "alumniOf": [
    { "@type": "CollegeOrUniversity", "name": "New York University" },
    { "@type": "CollegeOrUniversity", "name": "Rochester Institute of Technology" }
  ],
  "knowsAbout": ["Machine Learning", "Recommender Systems", "Distributed Systems"],
  "sameAs": [
    "https://github.com/nickgreenquist",
    "https://scholar.google.com/citations?user=28QAvAcAAAAJ&hl=en",
    "https://www.goodreads.com/user/show/26809953-nick-greenquist"
    // TODO: add LinkedIn URL from src/data/links.ts
  ]
})} />
```

### Sitemap
```bash
npx astro add sitemap
```
Then set `site: 'https://nickgreenquist.com'` in `astro.config.*` (required for sitemap + canonical URLs).

### RSS autodiscovery (in `<head>`)
```html
<link rel="alternate" type="application/rss+xml" title="Nick Greenquist — Blog" href="/blog/feed.xml" />
```

### Dark mode (Tailwind v4)
In `src/styles/global.css`:
```css
@custom-variant dark (&:where(.dark, .dark *));
```
Pre-paint script (inline in `<head>`, before body, to avoid FOUC):
```html
<script is:inline>
  const t = localStorage.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', t === 'dark');
</script>
```
Toggle with a View-Transitions circular reveal (progressive enhancement; falls back to instant swap):
```js
function toggleTheme(e) {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  const apply = () => {
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.theme = next;
  };
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply();
  document.startViewTransition(apply); // pair with ::view-transition clip-path keyframes from the toggle's x/y
}
```

### Skip link
```html
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow">Skip to content</a>
<!-- add id="main" to <main> on each page -->
```

### Console easter egg (inline script)
```js
console.log('%c👋 Hey, fellow dev. Code: https://github.com/nickgreenquist', 'font-size:14px');
```

---

## Notes / open questions for later
- Confirm `astro.config` has `site` set (needed for sitemap + correct canonical/OG absolute URLs).
- Confirm `[...slug].astro` OG image wiring before building per-post OG cards.
- Pull exact LinkedIn URL from `src/data/links.ts` for JSON-LD `sameAs`.
- Light visual audit still available: can screenshot the deployed site at desktop/mobile and mark up spacing/contrast/hover details vs. the reference sites above.
