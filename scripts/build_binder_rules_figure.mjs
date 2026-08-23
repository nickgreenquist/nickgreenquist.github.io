/* Builds the annotated two-page figure for the "two more rules" section of the
 * Pokédex binder post.
 *
 *   in:  public/blog/assets/PokedexBinder/page-10.webp, page-11.webp
 *   out: public/blog/assets/PokedexBinder/binder_rules_annotated.webp
 *
 * Pages 10 and 11 are the one spread that demonstrates both cosmetic rules at
 * once: page 10 ends Gen 1 at #151 with six pockets deliberately left empty,
 * and page 11 opens Gen 2 with an energy card heading each starter line.
 *
 * Source photos are never touched — this reads the already-encoded page WebPs.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR  = path.join(ROOT, 'public/blog/assets/PokedexBinder');

const PW = 1000, PH = 1345;          // page geometry
const COL = PW / 4, ROW = PH / 4;    // 4x4 pocket grid
const TOP = 200, PAD = 20, GAP = 40;
const L = PAD, R = PAD + PW + GAP;   // page x-origins
const W = PAD * 2 + PW * 2 + GAP;
const H = TOP + PH + 30;

const BG = '#0b0b0e', ACC = '#fbbf24', TXT = '#f5f5f5', SUB = '#a3a3a3';
const FONT = 'Helvetica, Arial, sans-serif';

/* page-10 empty pockets: row 3 cols 3-4, plus all of row 4 */
const eA = { x: L + COL * 2, y: TOP + ROW * 2 };
const emptyPath = `M${eA.x},${eA.y} H${L + PW} V${TOP + PH} H${L} V${TOP + ROW * 3} H${eA.x} Z`;

/* page-11 energy column: col 1, rows 1-3 */
const en = { x: R, y: TOP, w: COL, h: ROW * 3 };

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/>
    </marker>
  </defs>

  <text x="${L}" y="56" font-family="${FONT}" font-size="42" font-weight="700" fill="${TXT}">Page 10 — Gen 1 ends</text>
  <text x="${R}" y="56" font-family="${FONT}" font-size="42" font-weight="700" fill="${TXT}">Page 11 — Gen 2 starts fresh</text>

  <text x="${R}" y="132" font-family="${FONT}" font-size="34" fill="${ACC}">Each starter line opens with its energy symbol</text>
  <line x1="${R + COL / 2}" y1="148" x2="${R + COL / 2}" y2="${TOP + 58}" stroke="${ACC}" stroke-width="5" marker-end="url(#ah)"/>

  <rect x="${en.x}" y="${en.y}" width="${en.w}" height="${en.h}"
        fill="none" stroke="${ACC}" stroke-width="6" stroke-dasharray="18 12" rx="8"/>

  <path d="${emptyPath}" fill="${ACC}" fill-opacity="0.10" stroke="${ACC}"
        stroke-width="6" stroke-dasharray="18 12" stroke-linejoin="round"/>

  <text x="${L + PW / 2}" y="${TOP + ROW * 3 + 150}" text-anchor="middle"
        font-family="${FONT}" font-size="40" font-weight="700" fill="${ACC}">Six pockets left empty on purpose</text>
  <text x="${L + PW / 2}" y="${TOP + ROW * 3 + 202}" text-anchor="middle"
        font-family="${FONT}" font-size="33" fill="${TXT}">Gen 1 stops at #151, so the page stops too —</text>
  <text x="${L + PW / 2}" y="${TOP + ROW * 3 + 246}" text-anchor="middle"
        font-family="${FONT}" font-size="33" fill="${TXT}">a new generation never starts mid-page.</text>
</svg>`;

const page = f => sharp(path.join(DIR, f)).resize(PW, PH).toBuffer();

const out = path.join(DIR, 'binder_rules_annotated.webp');
await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: await page('page-10.webp'), left: L, top: TOP },
    { input: await page('page-11.webp'), left: R, top: TOP },
    { input: Buffer.from(svg), left: 0, top: 0 },
  ])
  .webp({ quality: 74, effort: 6 })
  .toFile(out);

const m = await sharp(out).metadata();
console.log(`wrote ${out}\n${m.width}x${m.height}  ${(m.size / 1024).toFixed(0)} KB`);
