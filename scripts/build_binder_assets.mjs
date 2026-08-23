/**
 * Build the web assets for the binder flipbook in the "Completing the Pokédex (in TCG)"
 * blog post.
 *
 *   node scripts/build_binder_assets.mjs [DEST_DIR]
 *
 * Reads the full-resolution edited photos (~2700x3700 each, gitignored) and emits:
 *   page-1.webp … page-69.webp        normalized to one canonical page size
 *   postit_note_example.webp          the page-69 photo used in the inline figure
 *   binder_layout_html_example.webp   the layout tool's page 69, its pair in that figure
 *
 * Images only — the post, the flipbook widget and the vendored StPageFlip runtime are
 * plain files under public/blog/assets/PokedexBinder/ and are edited directly. This is
 * the one part of the post that needs a build step, because the inputs are ~800 MB of
 * full-resolution photos in binder_photos/ (gitignored) that must never be committed.
 *
 * The source photos are hand-held shots, so their aspect ratios drift between
 * 0.727 and 0.758 (median 0.744). A flipbook needs ONE page size or the spread
 * jitters as you turn, so every page is center-cropped to the median ratio —
 * that trims at most ~2% off one edge, all of it empty binder margin.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'binder_photos/binder_pages_images_edits');
const args = process.argv.slice(2);
// Re-encoding 69 photos takes ~40s; --skip-images republishes only the widget.
const skipImages = args.includes('--skip-images');
const DEST = args.find(a => !a.startsWith('--')) ||
  path.join(ROOT, 'public/blog/assets/PokedexBinder');

// 1000x1345 = ratio 0.7435, the median of the 69 source photos. At the widest the
// flipbook renders a page ~540px across, so this still has room on a 2x display.
const PAGE_W = 1000;
const PAGE_H = 1345;
const QUALITY = 72;

const pageSources = fs.readdirSync(SRC)
  .filter(f => /\.jpe?g$/i.test(f) && !f.includes('postit'))
  .sort(); // filenames are 'YYYYMMDD_HHMMSS.jpg', so lexicographic == shooting order

if (pageSources.length === 0) {
  console.error(`No source photos in ${SRC}`);
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });
console.log(`src  ${SRC}\ndest ${DEST}\n${pageSources.length} pages -> ${PAGE_W}x${PAGE_H} webp q${QUALITY}\n`);

let total = 0;
if (skipImages) {
  console.log('--skip-images: leaving existing page images in place\n');
} else {
  for (const [i, file] of pageSources.entries()) {
    const out = path.join(DEST, `page-${i + 1}.webp`);
    const info = await sharp(path.join(SRC, file))
      .resize(PAGE_W, PAGE_H, { fit: 'cover', position: 'centre' })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);
    total += info.size;
    process.stdout.write(`\r  [${i + 1}/${pageSources.length}] ${path.basename(out)}  ${(info.size / 1024).toFixed(0)} KB   `);
  }
  console.log(`\n\npages: ${(total / 1048576).toFixed(1)} MB total, ${(total / pageSources.length / 1024).toFixed(0)} KB avg`);
}

// --- Inline figures -------------------------------------------------------
// These keep their own aspect ratios — they are normal inline images, not flipbook
// pages. Only two files, so they re-encode even under --skip-images (that flag exists
// to skip the 69-page loop, which is the slow part).
//
// The two are shown side by side in the post as a plan/execution pair of the SAME
// binder page 69, so they are sized for that: the photo renders at roughly a third of
// the pair's width and the screenshot at two thirds. The screenshot is UI with small
// text, so it keeps its native width and a higher quality than the photo needs.
const FIGURES = [
  { from: path.join(SRC, 'postit_note_example.jpg'),
    to: 'postit_note_example.webp', width: 1100, quality: 74 },
  { from: path.join(ROOT, 'binder_photos/binder_layout_html_example.png'),
    to: 'binder_layout_html_example.webp', width: 1480, quality: 88 },
];

for (const fig of FIGURES) {
  if (!fs.existsSync(fig.from)) { console.warn(`missing figure source ${fig.from}`); continue; }
  const info = await sharp(fig.from)
    .resize(fig.width, null, { withoutEnlargement: true })
    .webp({ quality: fig.quality, effort: 6 })
    .toFile(path.join(DEST, fig.to));
  console.log(`${fig.to.padEnd(33)} ${(info.size / 1024).toFixed(0)} KB`);
}

console.log(`\nWrote ${pageSources.length} pages to ${DEST}`);
