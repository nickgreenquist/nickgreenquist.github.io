# Binder flipbook

The interactive 69-page binder for the "Completing the Pokédex (in TCG)" post. Two facing pages on
a desktop spread, one page on a phone, with a real page-turn animation, swipe/drag, a page
scrubber and Gen 1–9 jump chips.

```
binder-flipbook.css   presentation (scoped to .pdxb, no framework)
binder-flipbook.js    behaviour (wraps StPageFlip)
embed.html            the block to paste into the markdown post
```

## Why this is plain HTML and not the React component

The draft post assumed an MDX + React blog. `nickgreenquist.github.io` is neither:

- `src/content.config.ts` loads `**/*.md` only — an `.mdx` file is not even picked up
- no `@astrojs/mdx`, no `@astrojs/react`, no `react` / `react-dom` in `package.json`
- all 15 existing posts are plain `.md`, and `.md` cannot import components

So `BinderViewer.jsx` could not run there without adding two integrations, two runtime
dependencies, a content-config change, and shipping a React runtime to every reader for one
widget. Instead this is vanilla HTML/CSS/JS built on **StPageFlip** — the same library
`react-pageflip` wraps, minus the React layer. It needs **zero** changes to the blog: Astro
passes raw HTML in markdown straight through, and both `<script>` tags execute (verified
against a real build, not assumed).

If the blog ever does gain MDX + React, this still works as-is — an HTML island is valid
inside MDX too.

## Publishing

From `pokedex-tracker/`:

```bash
npm install                                   # sharp, playwright, page-flip
node scripts/build_binder_assets.mjs          # images + runtime + widget -> the blog's public/
node scripts/build_binder_assets.mjs --skip-images   # widget only (fast, for iterating)
node scripts/publish_post.mjs                 # draft -> the blog's content collection
```

`build_binder_assets.mjs` reads the full-resolution photos in
`blog_post/binder_pages_images_edits/` (gitignored, ~510 MB) and writes
`page-1.webp … page-69.webp` to
`nickgreenquist.github.io/public/blog/assets/PokedexBinder/`, plus the vendored
`page-flip.browser.js` and the two widget files. Pass a different destination as the first
argument to point it somewhere else.

Every page is center-cropped to 1000×1345. The source photos are hand-held, so their aspect
ratios drift between 0.727 and 0.758; a flipbook needs one page size or the spread jitters as
you turn. The crop takes at most ~2% off one edge, all of it empty binder margin.

## Embedding

Paste `embed.html` into the post. The mount element carries its own configuration:

```html
<div class="pdxb not-prose" data-pdxb
     data-pages="69"
     data-base="/blog/assets/PokedexBinder/"
     data-ext=".webp"></div>
```

`data-base` + `page-<n>` + `data-ext` is how each page URL is built, so re-pointing the widget
at a different set of images is a one-attribute change.

## Loading behaviour

69 pages × ~286 KB is 19 MB, which is not something to hand a reader who scrolls past. Only a
window of ±3 pages around the reader ever gets a `src`; first paint costs ~4 images. Pages not
yet fetched show a shimmer instead of a white hole. Dragging the scrubber deliberately does
*not* fetch what it passes over — that would walk the entire binder — the window fills 150 ms
after the drag settles.

## Testing

```bash
cd ../nickgreenquist.github.io && npx astro build && npx astro preview --port 4399
cd ../pokedex-tracker && node scripts/test_binder_flipbook.mjs
```

Drives the real built blog at 1440/1280/1140/1024 px and on iPhone 14 / Pixel 7, checking
horizontal overflow, the spread↔single-page switch, flip/chip/scrubber behaviour, real touch
swipes in both directions, that touching the book does not steal vertical scrolling, that
lazy loading holds, and that nothing 404s or throws. Screenshots land in
`blog_post/screenshots/`.

Two library details the tests depend on, both found by reading the dist rather than guessing:
`touchstart` binds to `.stf__block` (not the wrapper, and `touchmove`/`touchend` go to
`window`), and a swipe only counts if touchstart→touchend is under a hard-coded 250 ms — so
the whole gesture has to be dispatched inside a single `page.evaluate`.

## Layout notes

- **Single vs two pages** is StPageFlip's own rule: portrait when the stage is narrower than
  `2 × minWidth`. `minWidth: 330` puts that break at a 660 px stage.
- The library also stamps `min-width: 330px` on its mount, which overflows a phone-width
  stage and clips the outer column of cards. The CSS zeroes that floor; the runtime only ever
  clamps page width *down* to the measured block width, so nothing else depends on it.
- On screens ≥1140 px the widget breaks out of the 720 px prose column to 1040 px. The
  breakpoint is chosen so the breakout always leaves >40 px of gutter, scrollbar included.
- The stage stays dark in both site themes: every photo is cards in a black binder page, so a
  dark surround reads as one object rather than a bright frame with dark holes in it.
