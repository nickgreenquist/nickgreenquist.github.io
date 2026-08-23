/* Builds the annotated Bulbapedia figure for Problem 1 of the Pokédex binder post.
 *
 *   in:  a screenshot of
 *        https://bulbapedia.bulbagarden.net/wiki/List_of_Pokémon_by_National_Pokédex_number
 *        scrolled to the #0050–#0054 block, ads removed, page zoom 2, viewport 1100x1500.
 *        Pass the path as argv[2].
 *   out: public/blog/assets/PokedexBinder/bulbapedia_regional_forms.webp
 *
 * The point of the figure: #0052 occupies three rows (Meowth, Alolan, Galarian).
 * Verified on the live page — 1,025 numbered entries across 1,220 table rows.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = process.argv[2];
if (!SRC) { console.error('usage: node scripts/build_dex_list_figure.mjs <screenshot.png>'); process.exit(1); }
const OUT = path.join(ROOT, 'public/blog/assets/PokedexBinder/bulbapedia_regional_forms.webp');

/* crop of the table inside the 1100x1500 screenshot */
const CROP = { left: 212, top: 8, width: 676, height: 1476 };
const PX = 40, PY = 40;                      // table position on the canvas
const W = 1900, H = CROP.height + PY * 2;

/* the three #0052 rows, in canvas coords (row height 148 at zoom 2) */
const mTop = PY + (600 - CROP.top), mBot = PY + (1044 - CROP.top);
const mMid = (mTop + mBot) / 2;

const BG = '#0b0b0e', ACC = '#fbbf24', TXT = '#f5f5f5', SUB = '#8a8a8a';
const F = 'Helvetica, Arial, sans-serif';
const TX = 880;

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="${ACC}"/>
    </marker>
  </defs>

  <rect x="${PX - 6}" y="${mTop}" width="${CROP.width + 12}" height="${mBot - mTop}"
        fill="none" stroke="${ACC}" stroke-width="7" stroke-dasharray="20 13" rx="8"/>

  <line x1="${TX - 40}" y1="${mMid}" x2="${PX + CROP.width + 20}" y2="${mMid}"
        stroke="${ACC}" stroke-width="6" marker-end="url(#ah)"/>

  <text x="${TX}" y="${mMid - 128}" font-family="${F}" font-size="62" font-weight="700" fill="${ACC}">One dex number,</text>
  <text x="${TX}" y="${mMid - 58}" font-family="${F}" font-size="62" font-weight="700" fill="${ACC}">three rows</text>

  <text x="${TX}" y="${mMid + 40}" font-family="${F}" font-size="38" fill="${TXT}">#0052 is Meowth, Alolan Meowth and</text>
  <text x="${TX}" y="${mMid + 92}" font-family="${F}" font-size="38" fill="${TXT}">Galarian Meowth — three entries where</text>
  <text x="${TX}" y="${mMid + 144}" font-family="${F}" font-size="38" fill="${TXT}">the binder needs exactly one.</text>

  <text x="${TX}" y="${mMid + 232}" font-family="${F}" font-size="38" fill="${TXT}">Regional forms sit under the same number</text>
  <text x="${TX}" y="${mMid + 284}" font-family="${F}" font-size="38" fill="${TXT}">as extra, unnumbered rows: 1,025 entries</text>
  <text x="${TX}" y="${mMid + 336}" font-family="${F}" font-size="38" fill="${TXT}">spread across 1,220 table rows.</text>

  <text x="${TX}" y="${H - PY - 8}" font-family="${F}" font-size="28" fill="${SUB}">bulbapedia.bulbagarden.net — List of Pokémon by National Pokédex number</text>
</svg>`;

const table = await sharp(SRC).extract(CROP).toBuffer();

await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
  .composite([
    { input: table, left: PX, top: PY },
    { input: Buffer.from(svg), left: 0, top: 0 },
  ])
  .webp({ quality: 82, effort: 6 })
  .toFile(OUT);

const m = await sharp(OUT).metadata();
console.log(`wrote ${OUT}\n${m.width}x${m.height}`);
