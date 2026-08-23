---
title: "Completing the Pokédex (in TCG)"
description: "Building a complete 1,025-card National Pokédex binder: the master list that did not exist, the page-and-pocket layout matrix, and a TCGplayer buy list."
date: "2026-08-22"
slug: "completing-the-tcg-pokedex"
category: miscl
---

> **TLDR:** With the help of Claude Code, I completed a correctly-ordered list of all 1,025 Pokémon. Technical details: **[nickgreenquist/Pokemon-TCG-Binder-Tracker](https://github.com/nickgreenquist/Pokemon-TCG-Binder-Tracker)**

---

<link rel="stylesheet" href="/blog/assets/PokedexBinder/binder-flipbook.css">

<div class="pdxb not-prose" data-pdxb
     data-pages="69"
     data-base="/blog/assets/PokedexBinder/"
     data-ext=".webp"></div>

<script src="/blog/assets/PokedexBinder/page-flip.browser.js" defer></script>
<script src="/blog/assets/PokedexBinder/binder-flipbook.js" defer></script>

*All 1,025 Pokémon in National Dex order*

---

## The list that does not exist

You'd think that somewhere on the internet there'd be a clean, correctly-ordered list of all 1,025 Pokémon. One you could actually build a collection from. There isn't. 

There are hundreds of lists (probably thousands), and ~90% of them are almost useless—half are out of order, half stop at Gen 8, and none of them map to an actual physical binder layout. 

I found this out because I wanted to do something simple: put one card of every Pokémon into a single binder, in National Dex order. I've wanted to do it since I was a kid, but it was always too big, too expensive, or took too much time. 

I have a son now. I wanted to build it now so I could hand it over to him later.

---

## 1. What I wanted (and why now)

The goal, stated flat: one card per Pokémon, National Dex order, 1 to 1,025, one binder.

I've wanted this since Gen 1, but running a manual inventory across 10 generations across 25+ years of card prints is a logjam. Why now? Simple: my son is growing up, and I wanted to finish a complete, tactile object to hand over to him rather than a scattered collection that sits in storage boxes.

---

## 2. The rule, and how it slipped

The rule was simple: one card per Pokémon, cheapest raw copy that does the job. 

It did not hold.

- **Gen 1:** I used the *151* set because I wanted to.
- **Gen 2:** I picked specific cards purely for the illustration quality.
- **Gen 5:** I got tired, dropped the aesthetic standards, and went back to picking whatever was cheapest just to hit completion.

That's fine. It's a binder for my kid to flip through, not a museum piece behind glass.

---

## 3. The two friction points that stop everyone

If you try to build a 1,025-card binder by hand, two things will break your spirit:

1. **The missing master list:** Getting a raw, clean dataset from 1 to 1,025 with zero gaps or alt-form bloat is surprisingly annoying.
2. **The binder penalty:** The binder punishes exactly one mistake. It's 84 pages, 16 pockets each — 1,344 slots. Put a card in the wrong pocket at #200 and fixing it means physically sliding hundreds of cards down one spot, one at a time. I did this once. Never again.

<figure class="page-pair not-prose">
  <div class="page-pair-row">
    <div class="page-pair-item page-pair-plan">
      <img src="/blog/assets/PokedexBinder/binder_layout_html_example.webp"
           alt="The layout tool showing binder page 69: Gen 9 Paldea, eleven Pokemon from #1015 Munkidori to #1025 Pecharunt, with five slots marked spare."
           loading="lazy" decoding="async" width="1480" height="792">
      <p class="page-pair-label">The plan — page 69 computed before a single card was placed: Gen 9, #1015–1025, five slots spare.</p>
    </div>
    <div class="page-pair-item page-pair-real">
      <img src="/blog/assets/PokedexBinder/postit_note_example.webp"
           alt="The same binder page 69 filled with cards, a yellow post-it note marked 69 stuck to the page, and five empty pockets at the bottom."
           loading="lazy" decoding="async" width="1100" height="1456">
      <p class="page-pair-label">The result — same eleven cards, same order, five pockets still empty. The post-it carries the page number.</p>
    </div>
  </div>
  <figcaption>Page 69 twice. Knowing every coordinate up front is what makes it safe to load cards in any order — and the five spare pockets are exactly the five the tool predicted.</figcaption>
</figure>

---

## 4. What Claude Code actually did (and where the API failed)

I used Claude Code to eliminate the manual labor and coordinate math.

### The layout tool
It built a clean dataset of all 1,025 Pokémon and computed the precise page-and-pocket coordinates for each card ahead of time. Knowing that Pikachu is *Page 2, Row 1, Column 1* meant I could load cards in any order, jump around across generations, and never shift a card downward again.

Specifically, it computed the entire binder layout accounting for the real geometry of my binder, with each generation starting on a fresh page and three energy cards leading each gen's starter rows. In this setup:
- Each generation opens with three energy-led rows (Grass / Fire / Water energy, each heading its starter line), followed by straight dex order.
- **Gen 5** gives its top-left slot to the mythical **#494 Victini** in place of the Grass Energy (because the dex doesn't care about my formatting).
- **Gen 8** previously skipped its energy leaders to squeeze the dex into 68 pages, but since the physical binder is 84 pages (1,344 slots), I updated the layout so Gen 8 gets its energy leaders too.
- The entire run fills **69 pages**, leaving the final 15 pages completely open for Gen 10.

### The API trap (and what to do instead)
Everyone building this tries to automate pricing. I tried pulling card values from a TCGPlayer price API to auto-select the cheapest printing per species. 

It failed constantly. The lowest-cost listings often lack reliable market-price metadata in API feeds, causing the absolute cheapest printings to fall completely out of sorted queries.

**The actual playbook:**
1. Search the Pokémon name on TCGPlayer directly.
2. Sort by **Price: Low to High**.
3. Select the card with the **highest number of active listings** (this is the true bottom-dollar card ~95% of the time).
4. Add all 1,025 items to your cart, then run **Cart Optimizer** to collapse shipping costs down to a handful of sellers.


---

## 5. Why do this at all?

I don't like accumulating clutter, and I generally try to keep life minimal. This binder is the exception because it is a single *finished* object, rather than an endless collection that expands forever.

It's not an investment strategy, and it's not for display clout. It's a complete physical artifact I built that my son can grow into. 

There are 15 empty pages at the back. When Generation 10 arrives, those cards go right into the empty slots. The project isn't finished—it's just no longer waiting on me.
