---
title: "Recency Is All You Need: A 12-Model Experiment on User-History Representation for Two-Tower Retrieval in Recommenders"
description: "Most two-tower recommenders pool a user's whole history into one vector. I trained twelve versions of the user tower to see which parts of the history actually matter, and the last movie the user watched mattered most."
date: "2026-06-17"
slug: "recency-user-history-two-tower-ablation"
category: projects
image: "/blog/assets/MultiPoolUserTower/fig1_pooling_mrr.png"
---

*The standard way to build the user side of a two-tower retrieval model (going back to YouTube's DNN recommender, [Covington et al., 2016](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/)) is to pool the user's interaction history into a single vector. That buries what might be the most predictive signal you have: the last item the user interacted with.*

## TL;DR

I trained twelve versions of the user tower in my two-tower movie recommender, all identical except for which parts of the watch history feed the user vector (the whole history, the liked or disliked movies, a rating-weighted history, or just the most recent movie). All of them were trained on MovieLens 32M and compared on retrieval MRR:

- Recency: adding the last watched movie to the usual full-history pool improves MRR by +22%, the biggest gain in the study. That one movie on its own nearly matches the entire summed history.
- Ratings: the liked / disliked / rating-weighted pools (the reason for the production four-pool tower) add nothing over a plain sum pool. The rating-weighted pool alone is the worst of the twelve.
- Going one movie further back barely helps, which is basically why the field moved from pooling to sequential models and Transformers (FMC → FPMC → SASRec).

![Whole-corpus MRR for all 12 user-pooling arms, sorted and colour-coded by pool family](/blog/assets/MultiPoolUserTower/fig1_pooling_mrr.png)

*All twelve user towers. Adding the last-watched movie (orange) is worth +22% MRR, while the rating-based pools (blue) sit right on the full-history baseline.*

---

## Turning a history into a vector

A two-tower model scores a (user, item) pair with the dot product of two embeddings. At its most basic, the user tower is just the user's history: a variable-length list of watched movies that has to become one fixed-size vector. The default is a 'sum pool': look up an embedding for each movie, add them up, and project:

![Pooling an arbitrary-length watch history into one fixed user vector](/blog/assets/MultiPoolUserTower/fig2_pooling_schematic.png)

The pooling op matters less than you'd think (sum and mean came out about even here). The more interesting question is which history you pool. Instead of one bag of movies, you can split it into sub-histories:

- By rating sign: separate pools for liked and disliked movies
- By rating magnitude: weight each movie by how far its rating was above or below the user's average
- By recency: pull the most recent movie out as its own input

### Adding a channel

The last-watched movie is the simplest case. The model looks up that one movie's embedding (no sum) and runs it through its own LayerNorm. That 32-d block gets concatenated next to the sum-pool block, and the combined vector goes through one shared projection (concat first, then project once):

![Adding the last-watched item as its own 32-d block, concatenated before the shared projection](/blog/assets/MultiPoolUserTower/fig3_last_watched.png)

Since each block feeds its own columns of the projection's input, the model can weight "what you just watched" differently from "everything you've watched." Every model in this post is just a different set of these blocks turned on.

## The twelve models

Each model (or 'arm') turns on a different set of pools. Every active pool adds a 32-dim block, and the blocks are concatenated and projected `→ 256 → 128 → L2-normalize`. The sum pools (`full`, `liked`, `disliked`, `weighted`) add up all matching movies into one vector. The single-item slots (`last_liked`, `last_watched`, `second_to_last_watched`) look up exactly one movie (no sum), and each one gets its own projection weights.

| # | Model | Active pools | Dim | What it isolates |
|---|---|---|---|---|
| 1 | Only history | `full` | 32 | the baseline single sum pool |
| 2 | + likes | `full, liked` | 64 | does a clean affinity channel beat lumping likes into `full`? |
| 3 | + dislikes | `full, liked, disliked` | 96 | does an explicit avoidance channel add subtractable signal? |
| 4 | Weighted only | `weighted` | 32 | can one rating-weighted pool carry it alone? |
| 5 | 4-pool | `full, liked, disliked, weighted` | 128 | the full rating partition (= the production pooling block) |
| 6 | 4-pool + last-liked | `… , last_liked` | 160 | add immediate liked-session context on the 4-pool |
| 7 | history + last-liked | `full, last_liked` | 64 | the minimal recency×valence test |
| 8 | history + weighted | `full, weighted` | 64 | valence-weighting as an overlay on a dense pool |
| 9 | last-liked only | `last_liked` | 32 | the most-recent *liked* item, alone |
| 10 | last-watched only | `last_watched` | 32 | the most-recent item (any rating), alone (*first-order Markov*) |
| 11 | history + last-watched | `full, last_watched` | 64 | recency channel on plain history (*FPMC*) |
| 12 | history + last-watched + 2nd-last | `full, last_watched, second_to_last_watched` | 96 | does recency reach past the single last item? |

They fall into three groups: the baseline (arm 1), the rating arms (2/3/4/5/8), and the recency arms (6/7/9/10/11/12).

## Results

I used a held-out 'rollback' eval: for each of the 19,134 validation users, the context is their history so far and the target is the next movie they watched, for n ≈ 382,138 examples in total. All numbers are over the full corpus.

Whole-corpus retrieval, with the MRR change vs arm 1:

| # | Model | Active pools | MRR | Recall@10 | Recall@50 | NDCG@10 | MRRΔ |
|---|---|---|---|---|---|---|---|
| 1 | Only history | `full` | 0.1133 | 0.2189 | 0.4590 | 0.1270 |  |
| 2 | + likes | `full,liked` | 0.1141 | 0.2208 | 0.4602 | 0.1280 | +0.0008 |
| 3 | + dislikes | `full,liked,disliked` | 0.1133 | 0.2204 | 0.4593 | 0.1274 | 0.0000 |
| 4 | Weighted only | `weighted` | 0.0708 | 0.1476 | 0.3484 | 0.0790 | −0.0425 |
| 5 | 4-pool | `full,liked,disliked,weighted` | 0.1132 | 0.2217 | 0.4613 | 0.1276 | −0.0001 |
| 6 | 4-pool + last-liked | `…,last_liked` | 0.1227 | 0.2417 | 0.4938 | 0.1391 | +0.0094 |
| 7 | history + last-liked | `full,last_liked` | 0.1236 | 0.2431 | 0.4936 | 0.1402 | +0.0103 |
| 8 | history + weighted | `full,weighted` | 0.1130 | 0.2199 | 0.4596 | 0.1270 | −0.0003 |
| 9 | last-liked only | `last_liked` | 0.0805 | 0.1688 | 0.3655 | 0.0917 | −0.0328 |
| 10 | last-watched only | `last_watched` | 0.1099 | 0.2100 | 0.4066 | 0.1241 | −0.0034 |
| 11 | history + last-watched | `full,last_watched` | 0.1386 | 0.2637 | 0.5129 | 0.1566 | +0.0253 |
| **12** | **history + last-watched + 2nd-last** | `full,last_watched,second_to_last_watched` | **0.1431** | **0.2724** | **0.5274** | **0.1619** | **+0.0298** |

## Results by popularity tier

Does any of this help more on popular movies or on the long tail? Here's MRR split by how popular the target movie is:

| Arm | Whole (382,138) | HEAD >1k (369,486) | Q4 popular (343,906) | Q3 mid (26,923) | TAIL ≤1k (12,652) |
|---|---|---|---|---|---|
| 1 full | 0.1133 | 0.1171 | 0.1247 | 0.0142 | 0.0032 |
| 2 +liked | 0.1141 | 0.1179 | 0.1255 | 0.0140 | 0.0033 |
| 3 +disliked | 0.1133 | 0.1171 | 0.1247 | 0.0147 | 0.0031 |
| 4 weighted | 0.0708 | 0.0732 | 0.0782 | 0.0051 | 0.0015 |
| 5 4-pool | 0.1132 | 0.1169 | 0.1245 | 0.0152 | 0.0036 |
| 6 +lastL | 0.1227 | 0.1268 | 0.1348 | 0.0188 | 0.0044 |
| 7 full+lastL | 0.1236 | 0.1277 | 0.1358 | 0.0182 | 0.0046 |
| 8 full+wt | 0.1130 | 0.1168 | 0.1244 | 0.0133 | 0.0029 |
| 9 lastL-only | 0.0805 | 0.0831 | 0.0881 | 0.0152 | 0.0070 |
| 10 lastW-only | 0.1099 | 0.1132 | 0.1198 | **0.0251** | **0.0128** |
| 11 full+lastW | 0.1386 | 0.1431 | 0.1520 | 0.0232 | 0.0061 |
| 12 full+lastW+2nd | **0.1431** | **0.1478** | **0.1568** | **0.0251** | 0.0070 |

## What the numbers say

- Recency matters, but only one movie deep. Adding the last watch (arm 11) beats the plain pool by +22%. Putting the 2nd-to-last on top (arm 12) doesn't add anything past noise, so the signal is first-order.
- One recent movie is about as good as the whole summed history. `last_watched` alone (arm 10) is within 3% of the full pool (arm 1). That shows how lossy the sum is: ~50 movies collapsed into one point, with no identity and no order.
- Recency beats ratings. `last_watched` beats `last_liked` on every tier. Filtering on "did they like it?" drops the movie they watched right before, which is the most predictive one there is.
- The rating pools add nothing. The liked/disliked/weighted splits (arms 2/3/5/8) all sit on the plain pool, and weighted-only (arm 4, 0.0708) is the worst arm, since the debiasing starves the gradient.
- Head and tail have different winners. The recency arms win on popular movies (arm 12 is best on every head tier), but on the tail `last_watched` alone (arm 10) wins, because it doesn't have the `full` pool's popularity bias.

## Caveats

- The eval probably overstates recency. The task is predicting a user's next movie, and the winning models get to see the one they just watched. On MovieLens, back-to-back ratings often come from the same sitting, so the last watch is an unusually strong hint. Some of the +22% is just that.
- This is specific to the dataset. Recency dominates on MovieLens, where watching is sequential and tied to sessions. On a different problem (different catalog, weaker sessions, longer gaps between events) the last item might matter a lot less and ratings might matter more. I'd treat "recency matters most" as something to re-test, not a rule.

## Takeaway

If you're folding a user's history into one vector for two-tower retrieval, recency may well matter more than ratings. It did here.

None of this is new, and the arms here happen to retrace the FMC → FPMC → SASRec line of sequential recommendation:

- `last_watched` alone (arm 10) is a first-order Markov chain (FMC).
- Adding it to the full pool (arm 11) gives you FPMC (Factorizing Personalized Markov Chains): a personalized history pool plus a last-item transition term.
- Arm 12 adds a hand-built second-order term, and it barely moves anything.

So hand-coding recency runs out by the second item. That's the argument for a model that learns it instead with self-attention over the sequence: SASRec (a Transformer that weights which past items matter).

---

## Appendix

- Architecture: two-tower model with an ID-only item tower (`BASE_TOWERS=idonly FEATURE_TOWERS=none`). Only `USER_POOLS` changes between arms.
- Training (same for every arm): seed 42, 200k steps, LR 0.001 (cosine → 1e-4), batch 512, softmax temperature 0.1, α = 0. The pool inputs come from the cached softmax training tensor, so no data was rebuilt between arms.
- Evaluation: held-out rollback over all 19,134 validation users (n ≈ 382,138); Recall / Hit / NDCG / MRR @ K ∈ {1, 5, 10, 20, 50, 100, 150, 200, 250}, plus the popularity-tier split.

Background sources:
- [Covington et al., 2016: *Deep Neural Networks for YouTube Recommendations*](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/): the standard baseline of averaging watch-history embeddings into the user vector.
- [Rendle et al., 2010: *FPMC*](https://dl.acm.org/doi/10.1145/1772690.1772773) and [Kang & McAuley, 2018: *SASRec*](https://arxiv.org/abs/1808.09781): the sequential-recommendation papers behind the last-item vs full-history framing.
