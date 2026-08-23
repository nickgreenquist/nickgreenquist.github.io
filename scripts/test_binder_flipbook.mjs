/**
 * Drive the published binder flipbook in a real browser against a real build of
 * the blog, at the viewports that matter.
 *
 *   node scripts/test_binder_flipbook.mjs [BASE_URL]
 *
 * Assumes the blog is already built and served (see the header of the run log
 * below for the exact commands). Screenshots land in blog_post/screenshots/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, devices } from 'playwright';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'blog_post/screenshots');
const BASE = process.argv[2] || 'http://localhost:4399';
const POST_URL = `${BASE}/blog/miscl/2026/08/22/completing-the-tcg-pokedex/`;

fs.mkdirSync(SHOTS, { recursive: true });

let failures = 0;
function check(name, pass, detail) {
  console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
  if (!pass) failures++;
}

/**
 * Real touch swipe. Playwright's touchscreen only taps, and StPageFlip listens
 * for touchstart on `.stf__block` (touchmove/touchend go to window), so a mouse
 * drag — or a drag aimed at the outer wrapper — proves nothing about what an
 * actual thumb gets.
 *
 * The whole gesture has to run inside one evaluate: the library only counts a
 * swipe if touchstart and touchend are less than its hard-coded 250ms apart,
 * and a round-trip per event blows straight through that.
 */
async function swipe(page, fromFrac, toFrac) {
  return page.evaluate(([fromFrac, toFrac]) => {
    const el = document.querySelector('.stf__block');
    const r = el.getBoundingClientRect();
    const y = r.top + r.height / 2;
    const xAt = f => r.left + r.width * f;

    const fire = (type, x) => {
      const t = new Touch({
        identifier: 1, target: el,
        clientX: x, clientY: y, pageX: x, pageY: y + window.scrollY,
      });
      const empty = type === 'touchend';
      el.dispatchEvent(new TouchEvent(type, {
        touches: empty ? [] : [t],
        targetTouches: empty ? [] : [t],
        changedTouches: [t],
        bubbles: true, cancelable: true,
      }));
    };

    fire('touchstart', xAt(fromFrac));
    for (let i = 1; i <= 6; i++) fire('touchmove', xAt(fromFrac + (toFrac - fromFrac) * (i / 6)));
    fire('touchend', xAt(toFrac));
  }, [fromFrac, toFrac]);
}

/**
 * Scroll the widget into view and let the runtime settle. The site header is
 * sticky, so park the widget below it rather than under it — otherwise the
 * screenshots show the header sitting on top of the binder.
 */
async function ready(page) {
  await page.waitForSelector('.pdxb[data-ready="1"]', { timeout: 15000 });
  // Let the runtime take over the stage height and the first images decode —
  // scrolling before that settles aims at a box that then moves.
  await page.waitForFunction(() => {
    const img = document.querySelector('.pdxb-page[data-loaded] img');
    return img && img.complete && img.naturalWidth > 0;
  }, null, { timeout: 15000 });
  await page.waitForTimeout(500);
  // behavior:'instant' matters — the default here animates, and a screenshot
  // taken mid-animation clips an empty strip of page.
  await page.evaluate(() => {
    const top = document.querySelector('.pdxb').getBoundingClientRect().top;
    window.scrollTo({ top: window.scrollY + top - 84, behavior: 'instant' });
  });
  await page.waitForTimeout(400);
}

async function state(page) {
  return page.evaluate(() => {
    const root = document.querySelector('.pdxb');
    const stage = document.querySelector('.pdxb-stage');
    return {
      spread: root.getAttribute('data-spread'),
      badge: document.querySelector('.pdxb-badge').textContent,
      count: document.querySelector('.pdxb-count').textContent,
      title: document.querySelector('.pdxb-title').textContent.trim(),
      activeGen: (document.querySelector('.pdxb-gen[aria-current="true"]') || {}).textContent,
      stageW: Math.round(stage.getBoundingClientRect().width),
      stageH: Math.round(stage.getBoundingClientRect().height),
      rootW: Math.round(root.getBoundingClientRect().width),
      loadedPages: document.querySelectorAll('.pdxb-page[data-loaded]').length,
      docScrollW: document.documentElement.scrollWidth,
      docClientW: document.documentElement.clientWidth,
    };
  });
}

const browser = await chromium.launch();
const errors = [];   // thrown JS
const missing = [];  // assets the post references but the build does not have

/** Attach the two failure channels worth separating: broken code vs broken links. */
function watch(page, label) {
  page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(`${label} console: ${m.text()}`); });
  page.on('response', r => { if (r.status() === 404) missing.push(new URL(r.url()).pathname); });
}

// ── Desktop ────────────────────────────────────────────────────────────────
for (const width of [1440, 1280, 1140, 1024]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  watch(page, `${width}px`);
  await page.goto(POST_URL, { waitUntil: 'networkidle' });
  await ready(page);

  const s = await state(page);
  console.log(`\n── ${width}px ──`);
  console.log(`  stage ${s.stageW}x${s.stageH}  widget ${s.rootW}  spread=${s.spread}  loaded=${s.loadedPages}`);
  check(`${width}: no horizontal overflow`, s.docScrollW <= s.docClientW, `scrollW ${s.docScrollW} vs clientW ${s.docClientW}`);
  check(`${width}: two-page spread`, s.spread === '1', s.badge);
  check(`${width}: lazy — few pages loaded`, s.loadedPages <= 10, `${s.loadedPages}/69`);

  if (width === 1440) {
    await page.screenshot({ path: path.join(SHOTS, 'flip_desktop_p1.png'), clip: await clipOf(page) });

    // Flip forward and confirm the badge advances.
    const before = s.badge;
    await page.click('.pdxb-nav[aria-label="Next page"]');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SHOTS, 'flip_desktop_midflip.png'), clip: await clipOf(page) });
    await page.waitForTimeout(800);
    const after = await state(page);
    check('1440: next advances the page', after.badge !== before, `${before} -> ${after.badge}`);
    await page.screenshot({ path: path.join(SHOTS, 'flip_desktop_p2.png'), clip: await clipOf(page) });

    // Generation jump.
    await page.click('.pdxb-gen >> nth=8');           // Gen 9
    await page.waitForTimeout(900);
    const gen9 = await state(page);
    check('1440: Gen 9 chip jumps to page 62', /\b62\b/.test(gen9.badge), gen9.badge);
    check('1440: Gen 9 chip becomes active', gen9.activeGen === 'Gen 9', String(gen9.activeGen));
    check('1440: header follows the jump', /Paldea/.test(gen9.title), gen9.title);
    await page.screenshot({ path: path.join(SHOTS, 'flip_desktop_gen9.png'), clip: await clipOf(page) });

    // Scrubber.
    await page.locator('.pdxb-scrub').fill('30');
    await page.waitForTimeout(600);
    const scrubbed = await state(page);
    check('1440: scrubber jumps to page 30', /\b30\b/.test(scrubbed.badge), scrubbed.badge);

    // Sweeping the scrubber end to end must not drag all 69 images down with
    // it — that would defeat the windowing entirely.
    const beforeSweep = (await state(page)).loadedPages;
    await page.evaluate(() => {
      const el = document.querySelector('.pdxb-scrub');
      for (let v = 1; v <= 69; v++) {
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await page.waitForTimeout(700);
    const swept = await state(page);
    check('1440: full scrubber sweep stays lazy', swept.loadedPages <= 40,
      `${beforeSweep} -> ${swept.loadedPages}/69 loaded`);

    // Dark mode.
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(SHOTS, 'flip_desktop_dark.png'), clip: await clipOf(page) });
  }
  await page.close();
}

// ── Mobile ─────────────────────────────────────────────────────────────────
for (const [name, device] of [['iPhone 14', devices['iPhone 14']], ['Pixel 7', devices['Pixel 7']]]) {
  const ctx = await browser.newContext({ ...device });
  const page = await ctx.newPage();
  watch(page, name);
  await page.goto(POST_URL, { waitUntil: 'networkidle' });
  await ready(page);

  const s = await state(page);
  console.log(`\n── ${name} (${device.viewport.width}px) ──`);
  console.log(`  stage ${s.stageW}x${s.stageH}  spread=${s.spread}  loaded=${s.loadedPages}`);
  check(`${name}: no horizontal overflow`, s.docScrollW <= s.docClientW, `scrollW ${s.docScrollW} vs clientW ${s.docClientW}`);
  check(`${name}: single page`, s.spread === '0', s.badge);
  check(`${name}: stage fits viewport`, s.stageW <= device.viewport.width, `${s.stageW} <= ${device.viewport.width}`);

  if (name === 'iPhone 14') {
    await page.screenshot({ path: path.join(SHOTS, 'flip_mobile_p1.png'), clip: await clipOf(page) });

    // Swipe right-to-left should turn the page forward...
    await swipe(page, 0.85, 0.12);
    await page.waitForTimeout(900);
    const swiped = await state(page);
    check('iPhone: swipe forward turns the page', /Page 2 /.test(swiped.badge), swiped.badge);
    await page.screenshot({ path: path.join(SHOTS, 'flip_mobile_p2.png'), clip: await clipOf(page) });

    // ...and left-to-right should turn it back.
    await swipe(page, 0.15, 0.88);
    await page.waitForTimeout(900);
    const back = await state(page);
    check('iPhone: swipe back turns the page', /Page 1 /.test(back.badge), back.badge);

    // A finger that lands on the book must not have vertical scrolling stolen
    // from it — the widget sits mid-article, so trapping the touch strands the
    // reader. Verified at the source: the library must leave touchstart's
    // default action intact, and `touch-action: pan-y` must survive.
    const scrollable = await page.evaluate(() => {
      const el = document.querySelector('.stf__block');
      const r = el.getBoundingClientRect();
      const t = new Touch({ identifier: 9, target: el, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
      const ev = new TouchEvent('touchstart', { touches: [t], targetTouches: [t], changedTouches: [t], bubbles: true, cancelable: true });
      el.dispatchEvent(ev);
      return {
        prevented: ev.defaultPrevented,
        touchAction: getComputedStyle(document.querySelector('.stf__parent')).touchAction,
      };
    });
    check('iPhone: touch on the book is not swallowed', scrollable.prevented === false, `defaultPrevented=${scrollable.prevented}`);
    check('iPhone: vertical panning stays allowed', /pan-y/.test(scrollable.touchAction), scrollable.touchAction);
  }
  await ctx.close();
}

async function clipOf(page) {
  const box = await page.locator('.pdxb').boundingBox();
  const vp = page.viewportSize();
  const x = Math.max(0, box.x - 12);
  const y = Math.max(0, box.y - 12);
  const clip = {
    x, y,
    width: Math.min(box.width + 24, vp.width - x),
    height: Math.min(box.height + 24, vp.height - y),
  };
  if (clip.width <= 0 || clip.height <= 0) {
    throw new Error(`widget is off-screen (box y=${Math.round(box.y)} h=${Math.round(box.height)}, viewport ${vp.width}x${vp.height})`);
  }
  return clip;
}

await browser.close();

console.log(`\n── JS errors ──`);
if (errors.length === 0) console.log('  none');
else errors.forEach(e => console.log(`  ${e}`));
check('no runtime JS errors', errors.length === 0, `${errors.length} logged`);

const missingUnique = [...new Set(missing)];
console.log(`\n── Missing assets ──`);
if (missingUnique.length === 0) console.log('  none');
else missingUnique.forEach(m => console.log(`  404  ${m}`));
check('every referenced asset resolves', missingUnique.length === 0, missingUnique.join(', '));

console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
console.log(`Screenshots: ${SHOTS}`);
process.exit(failures === 0 ? 0 : 1);
