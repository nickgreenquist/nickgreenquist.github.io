// Generates the full favicon set from one source design (the "NG" monogram).
//
// Why this exists: browsers, old browsers, iOS, and Android each want a
// different icon file. Hand-maintaining them drifts (see the bug where
// favicon.ico stayed the Astro logo while favicon.svg became "NG"). This
// script is the single source of truth — re-run it whenever the mark changes:
//
//   node scripts/gen-favicons.mjs
//
// It writes into public/ (served verbatim at stable URLs). Uses `sharp`, which
// is already present as an Astro dependency.

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

// Brand: "NG" in bold sans on a blue square. Concrete font names (not
// `system-ui`) so the rasterizer reliably finds a face. `rounded` matches the
// in-browser favicon.svg; full-bleed is for iOS/Android which apply their own
// mask and dislike transparent corners.
const BLUE = '#2563eb';
const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";

// `rounded` tab icons fill the square boldly (font 58) to match favicon.svg.
// Full-bleed icons use a smaller glyph (font 48) so "NG" stays inside the
// central ~80% maskable safe zone Android crops to.
function svg(size, { rounded }) {
  const rx = rounded ? 20 : 0;
  const fontSize = rounded ? 58 : 48;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
       <rect width="100" height="100" rx="${rx}" fill="${BLUE}"/>
       <text x="50" y="50" dominant-baseline="central" text-anchor="middle"
             font-family="${FONT}" font-weight="700" font-size="${fontSize}" fill="#ffffff">NG</text>
     </svg>`,
  );
}

const png = (size, opts) =>
  sharp(svg(size, opts))
    .png()
    .toBuffer();

// Opaque (no alpha) for the full-bleed icons iOS/Android composite themselves.
const pngOpaque = (size) =>
  sharp(svg(size, { rounded: false }))
    .flatten({ background: BLUE })
    .png()
    .toBuffer();

// Minimal PNG-in-ICO container (Vista+ / all modern browsers). Embeds each PNG
// verbatim behind a 6-byte header + 16-byte directory entry per image.
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  for (const [i, e] of entries.entries()) {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // width (0 = 256)
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette size
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.buf.length, b + 8); // image byte size
    dir.writeUInt32LE(offset, b + 12); // image byte offset
    offset += e.buf.length;
  }
  return Buffer.concat([header, dir, ...entries.map((e) => e.buf)]);
}

const out = (name, buf) =>
  writeFile(join(PUBLIC, name), buf).then(() =>
    console.log(`  wrote public/${name} (${buf.length} bytes)`),
  );

console.log('Generating favicons from the NG monogram…');

// Multi-size .ico for legacy browsers (this is the file the bug left stale).
const icoSizes = await Promise.all(
  [16, 32, 48].map(async (size) => ({ size, buf: await png(size, { rounded: true }) })),
);
await out('favicon.ico', buildIco(icoSizes));

// PNG tab icon (rounded, matches the SVG).
await out('favicon-96x96.png', await png(96, { rounded: true }));

// iOS home screen / Safari (180, opaque, full-bleed).
await out('apple-touch-icon.png', await pngOpaque(180));

// Android / PWA, referenced from the web manifest (full-bleed, maskable-safe).
await out('web-app-manifest-192x192.png', await pngOpaque(192));
await out('web-app-manifest-512x512.png', await pngOpaque(512));

console.log('Done. (favicon.svg is hand-authored — not regenerated here.)');
