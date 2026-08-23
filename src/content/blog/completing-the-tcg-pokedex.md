---
title: "Completing the Pokédex (in TCG)"
description: "With the help of Claude Code, I completed a correctly-ordered list of all 1,025 Pokémon (National Dex order)."
date: "2026-08-22"
slug: "completing-the-tcg-pokedex"
category: miscl
---

> **TLDR:** With the help of Claude Code, I completed a correctly-ordered list of all 1,025 Pokémon (National Dex order).

---

<div class="post-flourish not-prose">
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs><clipPath id="pokeball-clip"><circle cx="50" cy="50" r="46"/></clipPath></defs>
    <g clip-path="url(#pokeball-clip)">
      <rect x="0" y="0" width="100" height="50" fill="#ee1515"/>
      <rect x="0" y="50" width="100" height="50" fill="#f6f6f6"/>
      <rect x="0" y="44" width="100" height="12" fill="#1b1b1b"/>
    </g>
    <circle cx="50" cy="50" r="46" fill="none" stroke="#1b1b1b" stroke-width="6"/>
    <circle cx="50" cy="50" r="15" fill="#f6f6f6" stroke="#1b1b1b" stroke-width="6"/>
    <circle cx="50" cy="50" r="6" fill="#f6f6f6" stroke="#1b1b1b" stroke-width="3"/>
  </svg>
  <span>My actual binder below (all 69 pages, interactive)</span>
</div>

<link rel="stylesheet" href="/blog/assets/PokedexBinder/binder-flipbook.css">

<div class="pdxb not-prose" data-pdxb
     data-pages="69"
     data-base="/blog/assets/PokedexBinder/"
     data-ext=".webp"></div>

<script src="/blog/assets/PokedexBinder/page-flip.browser.js" defer></script>
<script src="/blog/assets/PokedexBinder/binder-flipbook.js" defer></script>

---

## The goal

I wanted a single binder holding one card for every 1,025 Pokémon (National Dex order).

The idea was simple: any card counts. Price and set didn't matter.

### Caveats:

1. **The first 151 are all from [SV 151](https://bulbapedia.bulbagarden.net/wiki/151_%28TCG%29).** I just liked the set. Still the cheapest card per Pokémon, only restricted to that one set (Special Illustration Rares and ultra rares were too expensive).
2. **Art override.** If I liked an illustration enough, I spent more instead of taking the cheapest copy — [this Salamence ex](https://www.tcgplayer.com/product/623604/pokemon-sv09-journey-together-salamence-ex-177-159?Language=English), for example.

### Two rules for the layout:

1. **A new generation always starts on a new page.** When a generation ends partway down a page, the rest of that page stays empty rather than being filled by the next one.
2. **Each starter line opens with an energy card.** Grass, Fire and Water, heading the three starter rows. Purely cosmetic. Gen 5 is the only exception (its top-left slot goes to #494 Victini instead).

<figure class="figure-wide not-prose">
  <img src="/blog/assets/PokedexBinder/binder_rules_annotated.webp"
       alt="Binder pages 10 and 11 side by side. Page 10 ends Generation 1 at Mew ex with six pockets outlined and left empty; page 11 opens Generation 2 with Grass, Fire and Water energy cards heading the Chikorita, Cyndaquil and Totodile rows."
       loading="lazy" decoding="async" width="2080" height="1575">
  <figcaption>Both layout rules on one spread. Gen 1 stops at #151 and leaves the rest of the page empty; Gen 2 opens on a fresh page, with an energy card heading each starter line.</figcaption>
</figure>

---

## Problem 1 — there's no list you can just copy

You'd think a plain list of all 1,025 Pokémon in order would be a solved problem. It isn't. Bulbapedia comes close, but there's no way to copy or export it down to just the names in order, and its tables fold in regional variants and alternate forms. I wanted the 1,025 and nothing else.

Claude Code scraped and stripped the extra forms back out and created [one CSV](https://github.com/nickgreenquist/Pokemon-TCG-Binder-Tracker/blob/main/pokedex.csv) (one row for every Pokémon from 1 to 1,025).

<figure class="figure-wide not-prose">
  <img src="/blog/assets/PokedexBinder/bulbapedia_regional_forms.webp"
       alt="A slice of Bulbapedia's National Pokedex table showing entries 0050 to 0054. Diglett, Dugtrio and Persian each carry an extra Alolan Form row, and number 0052 carries three rows: Meowth, Alolan Meowth and Galarian Meowth."
       loading="lazy" decoding="async" width="1900" height="1556">
  <figcaption>Why you can't just copy the list: regional forms are under the same dex number.</figcaption>
</figure>

---

## Problem 2 — finding the cheapest card

I tried to automate this: pull prices from the TCGplayer API and auto-pick the cheapest printing for each Pokémon. It didn't work. The cheapest listings are often the ones missing price data in the API, so the real 'cheapest' cards never surface in a sorted query.

So I gave up and went manual:

1. Search the Pokémon on TCGplayer.
2. Sort by price, low to high.
3. Take the card with the most active listings.
4. Let Cart Optimizer collapse the shipping at the end.

<figure class="figure-cards not-prose">
  <div class="figure-cards-row">
    <a href="https://www.tcgplayer.com/product/263883/pokemon-swsh09-brilliant-stars-flygon-v-full-art?Language=English">
      <img src="/blog/assets/PokedexBinder/flygon_v_brs_164.webp"
           alt="Flygon V full art, card 164 of 172 from Brilliant Stars: a green Flygon in flight against swirling orange."
           loading="lazy" decoding="async" width="734" height="1024">
    </a>
    <a href="https://www.tcgplayer.com/product/623604/pokemon-sv09-journey-together-salamence-ex-177-159?Language=English">
      <img src="/blog/assets/PokedexBinder/salamence_ex_jtg_177.webp"
           alt="Salamence ex, card 177 of 159 from Journey Together: a blue Salamence roaring against pink lightning."
           loading="lazy" decoding="async" width="733" height="1024">
    </a>
    <a href="https://www.tcgplayer.com/product/253360/pokemon-swsh08-fusion-strike-lucario-v?Language=English">
      <img src="/blog/assets/PokedexBinder/lucario_v_fst_146.webp"
           alt="Lucario V, card 146 of 264 from Fusion Strike: Lucario charging an aura sphere against a red sky."
           loading="lazy" decoding="async" width="734" height="1024">
    </a>
  </div>
  <figcaption>The art override, in practice: Flygon V, Salamence ex and Lucario V. The cheapest copy of each of these three costs between 15¢ and 50¢.</figcaption>
</figure>

---

## Problem 3 — the layout (the big one)

The binder is 84 pages, 16 pockets each: 1,344 slots. If you put one card in the wrong pocket at #200 and every card after it has to shift down a slot, by hand. I had to do that twice. I wasn't doing it again, so I turned to Claude Code.

Claude Code took my binder's dimensions and the spreadsheet and computed the entire layout up front — every Pokémon's page, row, and column before a single card went in. Knowing that Pikachu is page 2, row 1, column 1 means cards can be loaded in any order, and nothing ever shifts.

The two layout rules were baked into the same pass, so the page breaks and energy leaders came out of the plan instead of being something I had to remember.

<figure class="page-pair not-prose">
  <div class="page-pair-row">
    <div class="page-pair-item page-pair-plan">
      <img src="/blog/assets/PokedexBinder/binder_layout_html_example.webp"
           alt="The layout tool showing binder page 69: Gen 9 Paldea, eleven Pokemon from #1015 Munkidori to #1025 Pecharunt, with five slots marked spare."
           loading="lazy" decoding="async" width="1480" height="792">
      <p class="page-pair-label">The plan: page 69 computed before a single card was placed: Gen 9, #1015–1025, five slots spare.</p>
    </div>
    <div class="page-pair-item page-pair-real">
      <img src="/blog/assets/PokedexBinder/postit_note_example.webp"
           alt="The same binder page 69 filled with cards, a yellow post-it note marked 69 stuck to the page, and five empty pockets at the bottom."
           loading="lazy" decoding="async" width="1100" height="1456">
      <p class="page-pair-label">The result: same eleven cards, same order, five pockets still empty. The post-it carries the page number.</p>
    </div>
  </div>
</figure>

---

## What it cost

About a year, done casually.

In total: \$500–600. SV 151 was a choice. If you stick to the cheapest-copy rule without exceptions and it's cheaper.

Surprisingly, the [Ultra Beasts](https://bulbapedia.bulbagarden.net/wiki/Ultra_Beast_%28TCG%29) weren't a choice: they turn up in so few sets that even the cheapest printing has a high floor. [Nihilego](https://www.tcgplayer.com/product/149072) was the worst of them (about \$10 for the cheapest copy).

---

## Why do this at all

I've wanted this binder since I was a kid. I have a son now, and that's the actual reason it finally got built: I wanted one complete, physical thing to hand him instead of a scattered collection sitting in storage boxes.

---

## Appendix

Everything behind this project is in **[nickgreenquist/Pokemon-TCG-Binder-Tracker](https://github.com/nickgreenquist/Pokemon-TCG-Binder-Tracker)**. The finished list is [`pokedex.csv`](https://github.com/nickgreenquist/Pokemon-TCG-Binder-Tracker/blob/main/pokedex.csv), and the [live tracker](https://docs.google.com/spreadsheets/d/1FStZBCxWdJ_uC8c_WV24eZsVzI-EmIZHouPKxaG6pcY/edit?usp=sharing) is the copy I actually work from.
