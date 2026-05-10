Final Project Plan: Portfolio v2 (The Gateway)
1. Core Philosophy
The Hub Model: A high-speed router directing traffic to specialized platforms (GitHub for ML research, Adobe Portfolio for photography, LinkedIn for career).

Senior-Centric Bio: Lead with your current role as a Senior Software Engineer at Google, focusing on ML recommendation systems.

Zero-JS Core: Compile to static HTML with Astro, using native elements (like <details>) for interactivity.

Legacy Preservation via Reconstruction: Rebuild legacy pages (Wrestling, Map) as native Astro components to remove old jQuery and Bootstrap dependencies.

2. Technical Stack
Framework: Astro (Static Mode).

Styling: Tailwind CSS (No heavy component libraries).

Deployment: GitHub Pages via modern GitHub Actions (deploying directly from the workflow artifact).

Contact: Formspree (Backend-free HTML form).

Metadata: OpenGraph (OG) meta tags for professional social previews.

3. Implementation Phases
Phase 1: Environment & Safe Construction
Zero-Downtime Branching: Create a new v2 branch from the current master.

Initialize Astro: Run npm create astro@latest -- --template minimal in the v2 branch.

Local-Only Preview: Use npm run dev and npm run build && npm run preview for testing. Do not point GitHub Pages to the v2 branch; keep the live site on master until the final merge.

Add Tailwind: npx astro add tailwind.

Phase 2: Narrative & Data Extraction
Bio Trim: Lead with your Senior SWE role and ML impact at Google. Condense the history by explicitly removing irrelevant details like internships and lifeguarding.

Course Data Schema: Move the full course list from courses/index.html into a courses.json file.

Fields: { title, description, institution, term } to preserve current content depth.

Asset Strategy:

Images: Convert img/me.jpg to WebP.

Favicon: Keep as an optimized PNG or SVG. Do not convert to WebP (to maintain browser compatibility).

PDF: Move Resume.pdf to the public/ directory.

Sunset: Let the spaceelements/ directory die; do not migrate.

Phase 3: Component & Page Rebuilds
The Gateway Grid: A 6-8 card responsive grid using Tailwind.

Portals: GitHub, Adobe Portfolio, LinkedIn, Resume, Blog, /map, /wrestling.

Astro Legacy Rebuilds:

/wrestling: Re-implement as a clean, static Astro page using modern Tailwind styling, stripping all legacy jQuery and Bootstrap.

/map: Port the existing Google MyMaps iframe into a responsive Astro page.

EducationSection.astro: Render the RIT/NYU course lists using native HTML <details> and <summary> tags for zero-JS accordions.

Meta & Head: Add OG tags (og:title, og:image, og:description) to the global layout.

Phase 4: Modern Deployment & Clean Swap
Modern Workflow: Configure .github/workflows/deploy.yml to use actions/configure-pages@v3, actions/upload-pages-artifact@v2, and actions/deploy-pages@v2.

Pre-Swap Verification Checklist: Before the swap, "verified locally" means all of the following pass:
- npm run build exits clean (no errors, no warnings worth fixing)
- npm run preview loads in browser
- Every gateway card link resolves (no 404s, no localhost references baked into hrefs)
- Mobile viewport renders correctly (use browser devtools responsive mode)
- /wrestling and /map pages load and render properly
- OG meta tags present in <head> on every page (verify via meta inspector or curl + grep og:)
- Favicon loads
- Resume.pdf is reachable at the expected URL

The Clean Swap: Once v2 is verified locally:

Tag v1 as an emergency exit BEFORE the destructive push:

git tag v1-final master
git push origin v1-final

Then perform the swap:

git checkout v2

git push origin v2:master --force-with-lease

This replaces the master branch entirely with the clean Astro build, preventing a hybrid v1/v2 state.

Post-Swap Note: GitHub Pages takes ~1–5 minutes to rebuild after the force-push. A brief flicker, stale cache, or transient 404 during this window is expected; do not panic-revert. If something is genuinely broken after ~5 minutes, the v1-final tag is the rollback: git reset --hard v1-final && git push origin master --force-with-lease.

4. Success Metrics
Discovery Speed: Recruiter clicks the right professional link in under 3 seconds.

Maintenance: Adding a new course or travel marker requires only a single-line edit in a JSON file.

Professional Presence: Senior-level bio and clean metadata across all social platforms.