/* ===========================================================================
   Pokédex binder flipbook — behaviour
   ---------------------------------------------------------------------------
   Wraps StPageFlip (https://github.com/Nodlik/StPageFlip — the vanilla core that
   `react-pageflip` wraps) so the widget drops into a plain markdown post with no
   framework, no bundler and no CDN call.

   Mount point in the post:
     <div class="pdxb" data-pdxb data-pages="69"
          data-base="/blog/assets/PokedexBinder/" data-ext=".webp"></div>

   Everything below builds itself from that one element.

   The one non-obvious piece is image loading. 69 pages at ~286 KB each is 19 MB,
   which is not something to hand a reader who merely scrolls past. Only a window
   of pages around the reader ever gets a `src`, so first paint costs ~4 images
   and the rest arrive as they flip.
   ========================================================================= */

(function () {
  'use strict';

  /* Verified against the photos themselves: page 11 opens on Chikorita, 27 on
     Turtwig, 62 on Sprigatito. Pages are 1-based here, matching the badge. */
  var GENERATIONS = [
    { label: 'Gen 1', page: 1,  region: 'Kanto',  dex: '#1–151'    },
    { label: 'Gen 2', page: 11, region: 'Johto',  dex: '#152–251'  },
    { label: 'Gen 3', page: 18, region: 'Hoenn',  dex: '#252–386'  },
    { label: 'Gen 4', page: 27, region: 'Sinnoh', dex: '#387–493'  },
    { label: 'Gen 5', page: 34, region: 'Unova',  dex: '#494–649'  },
    { label: 'Gen 6', page: 44, region: 'Kalos',  dex: '#650–721'  },
    { label: 'Gen 7', page: 49, region: 'Alola',  dex: '#722–809'  },
    { label: 'Gen 8', page: 55, region: 'Galar',  dex: '#810–905'  },
    { label: 'Gen 9', page: 62, region: 'Paldea', dex: '#906–1025' }
  ];

  /* Pages kept loaded on each side of whatever is on screen. */
  var PRELOAD = 3;

  var ICON = {
    prev:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
    expand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    shrink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7"/></svg>'
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function generationFor(page) {
    var found = GENERATIONS[0];
    for (var i = 0; i < GENERATIONS.length; i++) {
      if (page >= GENERATIONS[i].page) found = GENERATIONS[i];
    }
    return found;
  }

  function build(root) {
    var total = parseInt(root.getAttribute('data-pages'), 10) || 0;
    var base  = root.getAttribute('data-base') || '';
    var ext   = root.getAttribute('data-ext') || '.webp';
    if (!total) return;

    if (typeof St === 'undefined' || !St.PageFlip) {
      console.warn('[binder-flipbook] StPageFlip did not load; leaving the mount empty.');
      return;
    }

    function srcFor(page) { return base + 'page-' + page + ext; }

    /* ---- chrome ---------------------------------------------------------- */
    var head  = el('div', 'pdxb-head');
    var title = el('div', 'pdxb-title');
    var count = el('div', 'pdxb-count');
    count.setAttribute('aria-live', 'polite');
    head.appendChild(title);
    head.appendChild(count);

    var stage = el('div', 'pdxb-stage');
    var book  = el('div', 'pdxb-book');
    var spine = el('div', 'pdxb-spine');
    var badge = el('div', 'pdxb-badge');

    var expand = el('button', 'pdxb-expand', ICON.expand);
    expand.type = 'button';
    expand.setAttribute('aria-label', 'View fullscreen');

    /* ---- pages ------------------------------------------------------------ */
    var pages = [];
    for (var p = 1; p <= total; p++) {
      var page = el('div', 'pdxb-page');
      var img  = el('img');
      img.alt = 'Binder page ' + p + ' of ' + total;
      img.setAttribute('data-src', srcFor(p));
      img.decoding = 'async';
      page.appendChild(img);
      book.appendChild(page);
      pages.push(page);
    }

    stage.appendChild(book);
    stage.appendChild(spine);
    stage.appendChild(badge);
    stage.appendChild(expand);

    /* ---- controls --------------------------------------------------------- */
    var prev = el('button', 'pdxb-nav', ICON.prev);
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Previous page');

    var next = el('button', 'pdxb-nav', ICON.next);
    next.type = 'button';
    next.setAttribute('aria-label', 'Next page');

    var scrub = el('input', 'pdxb-scrub');
    scrub.type = 'range';
    scrub.min = '1';
    scrub.max = String(total);
    scrub.value = '1';
    scrub.setAttribute('aria-label', 'Jump to binder page');

    var controls = el('div', 'pdxb-controls');
    controls.appendChild(prev);
    controls.appendChild(scrub);
    controls.appendChild(next);

    var gens = el('div', 'pdxb-gens');
    var genButtons = GENERATIONS.map(function (g) {
      var b = el('button', 'pdxb-gen', g.label);
      b.type = 'button';
      b.setAttribute('aria-label', 'Jump to ' + g.label + ' — ' + g.region + ', ' + g.dex);
      b.addEventListener('click', function () { goTo(g.page); });
      gens.appendChild(b);
      return b;
    });

    var hint = el('div', 'pdxb-hint', 'Drag a corner, swipe, or use the ← → keys.');

    root.setAttribute('role', 'region');
    root.setAttribute('aria-label', 'Pokédex binder, ' + total + ' pages');
    root.setAttribute('tabindex', '0');
    root.appendChild(head);
    root.appendChild(stage);
    root.appendChild(controls);
    root.appendChild(gens);
    root.appendChild(hint);

    /* ---- lazy image window ------------------------------------------------- */
    function load(page) {
      if (page < 1 || page > total) return;
      var node = pages[page - 1];
      if (node.hasAttribute('data-loaded')) return;
      var img = node.querySelector('img');
      img.src = img.getAttribute('data-src');
      node.setAttribute('data-loaded', '');
    }

    function loadAround(page) {
      var span = flip && flip.getOrientation() === 'landscape' ? 1 : 0;
      for (var i = page - PRELOAD; i <= page + span + PRELOAD; i++) load(i);
    }

    /* Dragging the scrubber fires a stream of input events, and eagerly filling
       the window at every one of them would pull all 69 images down — the exact
       thing the windowing is there to avoid. Load only where the drag settles. */
    var loadTimer = null;
    function loadAroundSoon(page) {
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(function () { loadAround(page); }, 150);
    }

    /* ---- flip runtime ------------------------------------------------------ */
    var reduceMotion = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var flip = new St.PageFlip(book, {
      /* Ratio must match the generated images (1000x1345) or pages letterbox. */
      width: 500,
      height: 673,
      size: 'stretch',
      /* StPageFlip drops to a single page when the container is narrower than
         2 x minWidth, so this is the one-page breakpoint: below a 660px stage it
         shows one page, above it an open spread. */
      minWidth: 330,
      maxWidth: 560,
      minHeight: 444,
      maxHeight: 754,
      usePortrait: true,
      autoSize: true,
      showCover: false,
      drawShadow: true,
      maxShadowOpacity: 0.5,
      flippingTime: reduceMotion ? 1 : 650,
      swipeDistance: 25,
      showPageCorners: true,
      useMouseEvents: true,
      mobileScrollSupport: true,
      disableFlipByClick: false
    });

    flip.loadFromHTML(pages);
    root.setAttribute('data-ready', '1');

    /* ---- state sync --------------------------------------------------------- */
    function currentPage() { return flip.getCurrentPageIndex() + 1; }

    function sync(deferLoad) {
      var page = currentPage();
      var spread = flip.getOrientation() === 'landscape';
      /* A spread shows two pages and StPageFlip snaps to even left-hand pages,
         so jumping to a generation that starts on an odd page lands it on the
         RIGHT half. Label the spread by its last visible page or the chip you
         just pressed stays unlit while its own first page is on screen. */
      var gen = generationFor(spread && page < total ? page + 1 : page);

      root.setAttribute('data-spread', spread ? '1' : '0');

      title.innerHTML = gen.label +
        ' <span class="pdxb-region">· ' + gen.region + ' ' + gen.dex + '</span>';

      if (spread && page < total) {
        badge.textContent = 'Pages ' + page + '–' + (page + 1) + ' / ' + total;
        count.textContent = 'Pages ' + page + '–' + (page + 1) + ' of ' + total;
      } else {
        badge.textContent = 'Page ' + page + ' / ' + total;
        count.textContent = 'Page ' + page + ' of ' + total;
      }

      scrub.value = String(page);
      prev.disabled = page <= 1;
      next.disabled = page >= total;

      for (var i = 0; i < genButtons.length; i++) {
        genButtons[i].setAttribute('aria-current', GENERATIONS[i] === gen ? 'true' : 'false');
      }

      if (deferLoad) loadAroundSoon(page);
      else loadAround(page);
    }

    function goTo(page) {
      page = Math.max(1, Math.min(total, page));
      loadAround(page);
      /* turnToPage is instant. A 60-page animated flip is not a flip, it is a
         wait — so long jumps cut, and only neighbours animate. */
      if (Math.abs(page - currentPage()) <= 1) flip.flip(page - 1);
      else flip.turnToPage(page - 1);
      sync();
    }

    flip.on('flip', sync);
    flip.on('changeOrientation', sync);

    prev.addEventListener('click', function () { flip.flipPrev(); sync(); });
    next.addEventListener('click', function () { flip.flipNext(); sync(); });

    scrub.addEventListener('input', function () {
      var page = parseInt(scrub.value, 10);
      /* Deliberately no load() here. Fetching each page the slider passes over
         walks the whole binder — the counter and the shimmer track the drag,
         and the images arrive the moment it settles. */
      flip.turnToPage(page - 1);
      sync(true);
    });

    /* Arrow keys are scoped to the widget rather than the window — this sits in
       the middle of an article and must not steal the reader's arrow keys. */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')       { flip.flipPrev(); sync(); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { flip.flipNext(); sync(); e.preventDefault(); }
    });

    expand.addEventListener('click', function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen();
    });

    document.addEventListener('fullscreenchange', function () {
      var full = document.fullscreenElement === root;
      expand.innerHTML = full ? ICON.shrink : ICON.expand;
      expand.setAttribute('aria-label', full ? 'Exit fullscreen' : 'View fullscreen');
      /* The stage changed size under the runtime; re-measure before syncing. */
      setTimeout(function () { flip.update(); sync(); }, 60);
    });

    sync();
  }

  function init() {
    var mounts = document.querySelectorAll('[data-pdxb]');
    for (var i = 0; i < mounts.length; i++) build(mounts[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
