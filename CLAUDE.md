# nickgreenquist.github.io

Personal portfolio site for Nick Greenquist — built on Astro + Tailwind, deployed to GitHub Pages via GitHub Actions. The site uses a **gateway model**: the home page is a hub of cards linking to professional and personal destinations (GitHub, LinkedIn, photography, wrestling, etc.) rather than hosting all that content directly.

## Stack

- **Framework**: Astro (static mode, TypeScript strict)
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`
- **Hosting**: GitHub Pages
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Contact form**: Formspree endpoint `https://formspree.io/f/maqvayqy`

## Project Structure

- `src/pages/` — five pages: `index.astro` (gateway), `education.astro`, `wrestling.astro`, `map.astro`, `contact.astro`
- `src/layouts/Layout.astro` — global head with OG/Twitter meta tags, sticky brand-only header, footer with GitHub/LinkedIn/Instagram links
- `src/components/` — `GatewayCard`, `EducationSection`, `SkillsSection`, `Gallery`
- `src/data/`
  - `about.ts` — headline, subhead, bio paragraphs
  - `courses.json` — 9 sections, 74 courses (extracted from v1's `courses/index.html` via cheerio)
  - `skills.ts` — 4 skill groups (Languages, ML/AI, Web, Tools)
- `src/assets/` — `me.jpg`, `wrestling/*.jpg` (Astro auto-converts to responsive WebP at build time)
- `public/` — `Resume.pdf`, `me-og.jpg` (social card image), favicons. Files here keep stable URLs.

## Local Development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # produces dist/
npm run preview  # serves built dist/
```

## Deployment

Every push to `master` triggers `.github/workflows/deploy.yml`:
1. `npm ci` + `npm run build`
2. Uploads `dist/` as the GitHub Pages artifact (`actions/upload-pages-artifact@v3`)
3. Publishes via `actions/deploy-pages@v4`

**Important**: GitHub Pages source must stay set to **"GitHub Actions"** (Settings → Pages → Source). The legacy "Deploy from a branch" option will not work because Astro requires a build step.

**Node version**: workflow pins to Node 22 (Astro requires `>=22.12.0`).

## Domain Situation

- Live at: `https://nickgreenquist.github.io/`
- Custom domain owned: `nickgreenquist.com` (GoDaddy) — currently uses GoDaddy's "Domain Forwarding" feature which is HTTP-only and triggers browser HTTPS warnings. See Future Work P0.

## Rollback

- `v1-final` git tag preserves the pre-rewrite v1 site
- Emergency rollback: `git reset --hard v1-final && git push origin master --force-with-lease`

## Future Work

### P0 — Fix nickgreenquist.com forwarding (credibility hit)

GoDaddy "Domain Forwarding" doesn't support HTTPS, so visiting `https://nickgreenquist.com` shows a browser security warning. Replace with proper custom-domain setup on GitHub Pages:

1. In GoDaddy DNS for `nickgreenquist.com`:
   - Remove the existing Domain Forwarding rule
   - Add four A records on the apex (`@`) pointing to GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Optionally add a CNAME for `www` → `nickgreenquist.github.io`
2. Add `public/CNAME` containing `nickgreenquist.com` (Astro copies `public/*` to the build artifact, which is how Pages picks up the custom domain on each deploy)
3. In repo Settings → Pages, set Custom domain to `nickgreenquist.com`, wait for DNS check to pass (~5–10 min), then enable **Enforce HTTPS**

### P1 — Add "Current Work" section on home page

A new section between Bio and Skills (or between Skills and Links — TBD) listing currently-being-built projects with links to their deployed Streamlit apps:
- Game recommender
- Book recommender
- Movie recommender

Treat similarly to the Links grid but with project-specific descriptions and live-demo URLs.

### P2 — Update Resume.pdf

`public/Resume.pdf` is the v1 file. Refresh with current role details and recent work before the next round of job-hunting.

## v2 Migration Notes (May 2026)

The v1 site (2014-era jQuery 1.11 + Bootstrap 3 template) was fully rewritten in Astro/Tailwind. Highlights:

- Built on a `v2` branch with master kept live throughout; force-pushed `v2:master` once verified. `v1-final` tag preserves the old state.
- All jQuery removed; legacy `/spaceelements` directory sunset
- `/wrestling` rebuilt as a native Astro page (not preserved as static HTML)
- `/map` ports the v1 Google MyMaps iframe into a responsive container
- `/education` is a dedicated page for the course accordion (was inline on v1 home)
- Bio rewritten as a narrative arc (Senior SWE @ Google lead → "winding road" career history including lifeguarding, RIT/wrestling captain, four internships, NYU → personal hobbies)
- Skills condensed from 6 percentage-bar groups to 4 tag rows (Languages, ML/AI, Web, Tools)
- Contact moved to its own page with a working Formspree form (v1 used a deprecated Formspree URL pattern that had been silently failing for years)
- Hero refined through several iterations: photo right of name (research-backed L-to-R entry point), `w-32 rounded-2xl` (no crop), top-aligned
- OG/Twitter meta tags added globally
- Deployment migrated from GitHub Pages "Deploy from a branch" to GitHub Actions (required for the Astro build step)
