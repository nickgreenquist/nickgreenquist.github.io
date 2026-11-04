---
title: "MissingNo.Zero: #1 on Pokémon Showdown in five generations with self-play RL"
description: "MissingNo.Zero, trained by self-play reinforcement learning, reached #1 on Pokémon Showdown's public random-battle ladders in five generations."
date: "2026-11-02"
slug: "missingno-zero-self-play-pokemon-showdown"
category: projects
pinned: 1
image: "/blog/assets/MissingNoZero/board_gen6.png"
---

<div class="not-prose" style="text-align: center; margin: 0 0 1.5rem;">
  <img src="/blog/assets/MissingNoZero/missingno.svg" height="150" alt="MissingNo." style="display: inline-block; height: 150px; width: auto;">
</div>

*MissingNo.Zero, trained by self-play reinforcement learning, reached #1 on Pokémon Showdown's public random-battle ladders in five generations.*

---

## TL;DR

- #1 in five generations (gens 1, 2, 4, 6 and 7), and top 10 (best #5) in gen 9.
- Pure self-play: it only ever learned from games against itself. No human games.
- Small and cheap: about 3M parameters. Gen 1 trained on my laptop in about 40 hours, and the whole project (six generations) cost about \$2,006 in rented GPUs.

## Real games on the public ladder

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
  <span>A gen 6 ladder win over a 1740-rated player (opponent anonymized)</span>
</div>

![A full gen 6 ladder game won by the agent, opponent anonymized](/blog/assets/MissingNoZero/battle_gen6.gif)

## The ladders

Each board's top 10 with my account at #1 (gen 9's at #5, its best). Other players' names are blanked.

<table>
  <tr>
    <th width="50%">Gen 1 · #1 on 2026-09-29</th>
    <th width="50%">Gen 2 · #1 on 2026-10-18</th>
  </tr>
  <tr>
    <td><img src="/blog/assets/MissingNoZero/board_gen1.png" width="100%" alt="Gen 1 random-battle top 10, nickgen1rbrlbot at #1, other names blanked"></td>
    <td><img src="/blog/assets/MissingNoZero/board_gen2.png" width="100%" alt="Gen 2 random-battle top 10, MissingNo.ZeroBot at #1, other names blanked"></td>
  </tr>
  <tr>
    <th>Gen 4 · #1 on 2026-10-08</th>
    <th>Gen 6 · #1 on 2026-10-16</th>
  </tr>
  <tr>
    <td><img src="/blog/assets/MissingNoZero/board_gen4.png" width="100%" alt="Gen 4 random-battle top 10, nickgen4rbrlbot at #1, other names blanked"></td>
    <td><img src="/blog/assets/MissingNoZero/board_gen6.png" width="100%" alt="Gen 6 random-battle top 10, nickgen6rbrlbot at #1, other names blanked"></td>
  </tr>
  <tr>
    <th>Gen 7 · #1 on 2026-10-24</th>
    <th>Gen 9 · best #5 on 2026-10-25</th>
  </tr>
  <tr>
    <td><img src="/blog/assets/MissingNoZero/board_gen7.png" width="100%" alt="Gen 7 random-battle top 10, MissingNo.ZeroBot at #1, other names blanked"></td>
    <td><img src="/blog/assets/MissingNoZero/board_gen9.png" width="100%" alt="Gen 9 random-battle top 10, MissingNo.ZeroBot at #5, other names blanked"></td>
  </tr>
</table>

| Gen | Result | Date | Peak Elo | Evidence |
|---|---|---|---|---|
| 1 | **#1** | 2026-09-29 | 1726 | [archived](https://web.archive.org/web/20260929211638/https://pokemonshowdown.com/ladder/gen1randombattle?snap=1790716595) |
| 4 | **#1** | 2026-10-08 | 1738 | [archived](https://web.archive.org/web/20261008184118/https://pokemonshowdown.com/ladder/gen4randombattle) |
| 6 | **#1** | 2026-10-16 | 1942 | [archived](https://web.archive.org/web/20261016121841/https://pokemonshowdown.com/ladder/gen6randombattle?snap=1792153118) |
| 2 | **#1** | 2026-10-18 | 1558 | [archived](https://web.archive.org/web/20261018142133/https://pokemonshowdown.com/ladder/gen2randombattle?snap=1792333234) |
| 7 | **#1** | 2026-10-24 | 1900 | [archived](https://web.archive.org/web/20261024193431/https://pokemonshowdown.com/ladder/gen7randombattle?snap=1792870430) |
| 9 | best #5 | 2026-10-25 | 2453 | [archived](https://web.archive.org/web/20261025072637/https://pokemonshowdown.com/ladder/gen9randombattle?snap=1792913158) |

## The idea

I wanted a real reinforcement learning project, and I love Pokémon. That led me to [Pokémon Showdown](https://pokemonshowdown.com/), where anyone can battle online on public, ranked ladders.

On July 25, 2026, I set out to reach #1 in gen 1, my favorite generation and the one I grew up with. 66 days later, MissingNo.Zero was #1 on the gen 1 ladder. By October 24 it was #1 in four more.

<div class="post-timeline not-prose" style="margin: 1.5rem 0;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 132" style="width: 100%; height: auto; display: block;" role="img" aria-label="Timeline: start July 25, 2026. Earlier gen 1 ladder runs: August 25 and 27 below the top 500, September 4 seen at #369, September 16 in the top 500, September 27 best #5. #1 in gen 1 on September 29 after 66 days; then gen 4 on October 8, gen 6 on October 16, gen 2 on October 18 and gen 7 on October 24" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" fill="currentColor">
<defs><clipPath id="tl-pb-clip"><circle cx="0" cy="0" r="6.5"/></clipPath><g id="tl-pb" transform="scale(0.9)"><g clip-path="url(#tl-pb-clip)"><rect x="-7" y="-7" width="14" height="7" fill="#ee1515"/><rect x="-7" y="0" width="14" height="7" fill="#f6f6f6"/><rect x="-7" y="-0.9" width="14" height="1.8" fill="#1b1b1b"/></g><circle r="6.5" fill="none" stroke="#1b1b1b" stroke-width="1.4"/><circle r="2.2" fill="#f6f6f6" stroke="#1b1b1b" stroke-width="1.2"/></g></defs>
<line x1="40" y1="78" x2="700.0" y2="78" stroke="currentColor" stroke-opacity=".35" stroke-width="2"/>
<line x1="40" y1="78" x2="513.5" y2="78" stroke="currentColor" stroke-opacity=".6" stroke-width="2" stroke-dasharray="3 4"/>
<circle cx="40" cy="78" r="6" fill="none" stroke="currentColor" stroke-width="2"/>
<text x="40" y="102" font-size="12" text-anchor="middle" font-weight="600">Start</text><text x="40" y="116" font-size="11" text-anchor="middle" fill-opacity=".7">Jul 25</text>
<path d="M40.0 30 V24 H513.5 V30" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/><text x="276.7" y="17" font-size="12" text-anchor="middle" fill-opacity=".85">66 days to the first #1</text>
<path d="M513.5 30 V24 H692.8 V30" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="1.5"/><text x="603.2" y="17" font-size="12" text-anchor="middle" fill-opacity=".85">4 more in 25 days</text>
<circle cx="262.4" cy="78" r="4" fill="currentColor" fill-opacity=".55"/>
<circle cx="276.7" cy="78" r="4" fill="currentColor" fill-opacity=".55"/>
<circle cx="334.1" cy="78" r="4" fill="currentColor" fill-opacity=".55"/>
<circle cx="420.2" cy="78" r="4" fill="currentColor" fill-opacity=".55"/>
<circle cx="499.1" cy="78" r="4" fill="currentColor" fill-opacity=".55"/>
<text x="269.6" y="100" font-size="11" text-anchor="middle" fill-opacity=".75">unranked &#215;2</text>
<text x="334.1" y="100" font-size="11" text-anchor="middle" fill-opacity=".75">#369</text>
<text x="420.2" y="100" font-size="11" text-anchor="middle" fill-opacity=".75">top 500</text>
<text x="499.1" y="100" font-size="11" text-anchor="middle" fill-opacity=".75">#5</text>
<text x="334.1" y="120" font-size="11" text-anchor="middle" fill-opacity=".6" font-style="italic">earlier gen 1 ladder runs, best rank</text>
<use href="#tl-pb" x="513.5" y="78"/>
<text x="513.5" y="51" font-size="12" text-anchor="middle" font-weight="600">Gen 1</text><text x="513.5" y="64" font-size="11" text-anchor="middle" fill-opacity=".7">Sep 29</text>
<use href="#tl-pb" x="578.0" y="78"/>
<text x="578.0" y="102" font-size="12" text-anchor="middle" font-weight="600">Gen 4</text><text x="578.0" y="116" font-size="11" text-anchor="middle" fill-opacity=".7">Oct 8</text>
<use href="#tl-pb" x="635.4" y="78"/>
<text x="635.4" y="51" font-size="12" text-anchor="middle" font-weight="600">Gen 6</text><text x="635.4" y="64" font-size="11" text-anchor="middle" fill-opacity=".7">Oct 16</text>
<use href="#tl-pb" x="649.8" y="78"/>
<text x="649.8" y="102" font-size="12" text-anchor="middle" font-weight="600">Gen 2</text><text x="649.8" y="116" font-size="11" text-anchor="middle" fill-opacity=".7">Oct 18</text>
<use href="#tl-pb" x="692.8" y="78"/>
<text x="692.8" y="51" font-size="12" text-anchor="middle" font-weight="600">Gen 7</text><text x="692.8" y="64" font-size="11" text-anchor="middle" fill-opacity=".7">Oct 24</text>
</svg>
</div>

## How it differs from chess and Go

Most people know game-playing RL from chess and Go. Pokémon random battles are a different kind of game in four ways:

- Hidden information: you can't see the opponent's team, moves or items until they're revealed.
- Chance: damage rolls and critical hits make every turn random.
- Simultaneous moves: both players pick at the same time, so being predictable gets punished.
- Random teams: every game starts from a new, randomly dealt matchup.

## How it learns

The idea comes from [AlphaZero](https://doi.org/10.1126/science.aar6404): one general algorithm that learns from self-play alone. Each generation is basically a new game (only the rules, the input encoding and a few settings change).

- Self-play PPO: a small policy-and-value network trains against itself and its past versions.
- Showdown's own simulator: most gens trained on the exact same program that runs the ladder.
- Fresh every month: Showdown rebalances random battles every month, so each run trained on that month's teams and laddered before the next patch.
- Search only at play time: on the ladder, a short look-ahead guided by the network picks each move (on my laptop's CPU).

I'm not sharing the code or weights for now. Showdown's bot policy is brand new, and I'd rather not make it easier for people to run strong bots that don't follow it.

## Prior work

- [Wang (2024)](https://dspace.mit.edu/handle/1721.1/153888), an MIT thesis, gave me my starting recipe. It and [Foul Play](https://pmariglia.github.io/posts/foul-play/) reported peak ranks of 8 and 3 on the gen 4 random-battle ladder.
- [Jaxcalibur](https://jaxcalibur.github.io/) reached #1 in gen 9 with self-play PPO in August. My gen 1 agents were already laddering (best #5 at the time). Its write-up showed self-play PPO could reach #1 without search during training, which was a dead end I'd been stuck on, so I dropped it and borrowed several of its ideas.
- The [PokéAgent Challenge](https://arxiv.org/abs/2603.15563), a NeurIPS 2025 competition, was played in gen 1 OU and gen 9 OU on a separate server for AI agents, with no public-ladder rank.

## Training cost

| Gen | Steps | Hardware | Time | Rented compute |
|---|---|---|---|---|
| 1 | 100M | laptop (Apple M4 Pro) | ~40 hours | none |
| 2 | 600M | rented GPU | ~3 days | ~\$160 |
| 4 | 700M | rented GPU | ~6 days | ~\$230 |
| 6 | 600M | rented GPU | ~4 days | ~\$170 |
| 7 | 600M | rented GPU | ~4 days | ~\$220 |
| 9 | 800M | rented GPU | ~8 days | ~\$280 |

The table covers each final network's own run. The whole project (dead ends and tests included) cost about \$2,006 in rented GPUs.

## Measuring strength offline

A ladder run is too few games to tell two models apart, so I compared models offline over thousands of battles against [Foul Play](https://github.com/pmariglia/foul-play), an open-source search bot that won the gen 9 OU track of the NeurIPS 2025 PokéAgent Challenge.

One catch: Foul Play searches for a set amount of time per move, so it plays weaker on a slower machine (or when several copies share one). My fix was to switch it from time to iterations. I measured how many search iterations Foul Play reaches in its time budget on my laptop, then fixed it at that count. That way it plays at the same strength anywhere, and I could run thousands of games in parallel on rented servers.

## Lessons learned

### 1. Search made the agent worse (at first)

My first version of search actually LOST win rate: 6.8 points on my gen 1 networks. Search picked the move with the highest value estimate, but those estimates were noisy, and with noisy estimates the 'best' move is usually just the luckiest one (the 'optimizer's curse'). It was overruling the network on 72.8% of moves.

The fix was simple: only trust search when it beats the network's pick by a clear margin. After that it overruled the network on 8.5% of moves, and search went from costing 6.8 points to adding 1.6.

### 2. The value head took over

The policy and value heads share one trunk. In the runs that trained without a teacher, the value gradient into that trunk was about 50x the policy's. So the network got good at predicting who wins and bad at actually playing (it ignored things like status conditions and gen 9's Tera types), even though its win rates looked fine.

The fix was to only let a fraction of the value gradient reach the trunk (plus a shorter advantage horizon and an entropy schedule), and to auto-pause any run where the ratio started climbing early. Gen 6 trained this way and reached #1.

### 3. Gen 2 didn't understand sleep

Gen 2's first model was great in short games (57-5) and bad in long ones (5-14). The replays showed the problem was sleep: asleep from Rest with Sleep Talk available, it picked a move that fails while asleep 28% of the time. It turned out the network was looking at "did I just use Rest?" instead of "am I asleep?".

I could have hard-coded "if asleep, use Sleep Talk", but then it isn't self-play anymore. Instead I retrained it with a focus on sleep and long games. Against Foul Play, the new model won 72.0% of games vs 58.4% for the old one (about 3,000 games each), and it reached #1 on its second ladder run.

### 4. Use the real simulator

I tried porting Showdown's rules to a faster engine for each generation. It was slow to build and never quite exact (one port skipped every battle with a Ditto, so the agent never learned to play it). Keeping Showdown's own simulator and just changing how training drove it was nearly as fast, and exact from day one.

### 5. Train on this month's teams

Showdown changes the random-battle sets every month, and that includes the older generations. My first gen 4 runs trained on July's teams while the ladder was dealing September's. Now every run trains on the current month's teams and ladders before the next patch.

## Following Showdown's bot rules

- Openly a bot: every account had 'bot' in its name, and it never chatted or added delays to look human. It also never reported or blocked another player.
- Registered: when Showdown's bot registry opened on 2026-10-13, all four of my accounts were registered as bots.
  - Gens 1 and 4: #1 before Showdown had a bot policy.
  - Gens 2 and 6: registered bots, before the bot opt-in (2026-10-20); matched like any other account.
  - Gens 7 and 9: after the opt-in; only opted-in players and other bots.
- Run at home: every ladder game ran on my laptop, never on rented hardware.
- Moderators first: any contact from a moderator would have stopped every ladder run until I'd answered it. None came.

## Built with Claude Code

I built this with five [Claude Code](https://claude.com/claude-code) sessions running in parallel, each owning one job:

- Project manager: held the plan and my to-do list, and reviewed the others' work.
- Training: rented GPUs and ran the training runs.
- Ladder: ran the ladder and analyzed the games.
- Engine: each generation's simulator and rules.
- Helper: side tasks the others handed it.

They shared one rules file and a log of my decisions, and messaged each other directly. For about three weeks in October I split them across two Claude accounts to spread out the usage, so their messages went through files instead.

## Appendix

- [GitHub README](https://github.com/nickgreenquist/missingno-zero): every board, six ladder games, an FAQ and the technical report (PDF).
- [Smogon thread](https://www.smogon.com/forums/threads/missingno-zero-a-pure-self-play-reinforcement-learning-bot-that-reached-1-on-five-random-battle-ladders.3790707/)

<small>*Written in a personal capacity; the views here are my own.*</small>
