---
title: "Taming popularity bias in recommender systems with logit adjustment"
description: "My two-tower recommender kept recommending the same blockbusters to everyone. One extra term in the training loss got it recommending niche films that actually fit each user's taste."
date: "2026-06-14"
slug: "taming-popularity-bias-logit-adjustment"
category: projects
image: "/blog/assets/PopularityBias/ww2_poster_board.png"
pinned: 3
---

*My recommender kept recommending the same blockbusters to everyone. This is how I got it to recommend niche films that actually fit each user's taste.*

---

Take a WW2 movie buff whose watchlist is *Saving Private Ryan*, *Enemy at the Gates*, *Stalingrad* and *The Great Escape*. What should they watch next?

Below are the recommendations for that user from two versions of my two-tower model. Both use the same architecture and code. The only difference is that the one on the right was trained with a popularity correction (explained below) and the one on the left wasn't.

![WW2 movie buff: α=0 (left, before) vs α=0.5 (right, after) recommendations, each poster badged with its MovieLens rating count](/blog/assets/PopularityBias/ww2_poster_board.png)

The left side (before) is pretty bad for a WW2 fan: *Braveheart*, *Gladiator*, *The Lord of the Rings* (twice) and *The Godfather Part II*. Six of the ten aren't even war movies. They're just really popular (*Braveheart* alone has 75,514 ratings).

The right side (after) is actual war films: *The Devil's Brigade*, *Cross of Iron*, *Tora! Tora! Tora!*, *Battle of Britain*. Most of them have only a few hundred ratings, which is the kind of deeper catalog a real enthusiast wants. The median recommendation went from 35,547 ratings to 1,083 (roughly 33× less mainstream), and the recommendations are more on-genre too.

It's not just WW2 fans. I got the same kind of before/after for every taste I tried, and there are six more in the [Appendix](#appendix-more-examples) (high-fantasy, crime, courtroom, vintage sci-fi, giallo horror and screwball comedy). The courtroom fan's 'before' list is basically the IMDb Top 10.

## Popularity bias

This is called 'popularity bias', and it's a feedback loop:

1. Popular movies get shown more, so they get more clicks.
2. You train on those clicks, so the model learns that popular = good.
3. The model shows popular movies even more, and you're back at step 1.

Left alone, a 'personalized' recommender slowly turns into a Most Popular list. Everyone gets the same blockbusters and the rest of the catalog (the 'long tail') never gets recommended.

## The fix: logit adjustment

The fix comes from a 2020 paper, ["Long-Tail Learning via Logit Adjustment" (Menon et al.)](https://arxiv.org/abs/2007.07314). The idea is really simple: during training, add a bonus to every movie's score based on how popular it is (including the negatives).

```python
# during training only: add each movie's log-popularity to its score
scores = user · movie_embeddings  +  α · log(1 + rating_count)
```

The bonus only exists in training, so all you do is retrain a new model. Nothing changes at serving time, which also makes it very easy to A/B test online.

There's one knob, α. At `α=0` you get the blockbuster list from above, and if you set it too high the recommendations get way too obscure. I went with `α=0.5`, which fixes the drift but still lets *Saving Private Ryan* show up.

## Why a popularity bonus reduces popularity bias

This sounds backwards at first. The model trains with a full softmax: each example scores the true next movie against every movie in the catalog, and the `α · log(popularity)` bonus gets added to all of them. So popular movies are always sitting among the negatives with a head start, and the only way to lower the loss is to score the true movie high enough to beat them. Over millions of examples, the model learns scores that mean 'relevance after accounting for popularity': a movie only ranks high if you'd like it more than its popularity alone would predict. At serving time you drop the bonus and rank on those scores, so a niche film that fits you well can finally beat a blockbuster.

For the math: at the optimum, each raw score goes to `log P(movie | you) − α · log(popularity)`, which is your relevance with the popularity base rate divided back out. The bonus is ONLY used in training. At serving you rank on the raw score, which already has the popularity discount built in. The paper shows this is Fisher-consistent, so it's not just a heuristic.

## Why not fix it after the model?

Most teams deal with popularity bias after the model, with things like demotion multipliers, caps on blockbusters per page, or a separate diversity re-ranker. These are heuristics nobody fully trusts, they break as the catalog changes, and they add another stage to serving. Logit adjustment is one line in the loss, it has real theory behind it (the Fisher-consistent result above), and it's easy to maintain: if your team thinks the debiasing is too aggressive, you just re-tune α in the next retrain.

It also isn't specific to two-tower models. The correction is in the softmax, so it works for any model trained with cross-entropy over candidate items (ranking models included).

## Results

To make sure this wasn't just a couple of cherry-picked users, I ran both models over 60,000 held-out recommendation contexts from 3,000 real users and measured how popular their recommendations were:

| | Before (α=0) | After (α=0.5) | |
|---|---:|---:|---|
| **Median recommendation popularity** | 26,830 ratings | **13,200** | **↓ 51%** |
| **Catalog coverage** (distinct films ever shown) | 4,485 (48%) | **7,899 (84%)** | **+3,414 movies** |
| **Exposure inequality** (Gini) | 0.907 | **0.776** | more equal |
| **Long-tail share of recommendations** | 0.2% | **4.3%** | **~20×** |

The median recommendation is half as popular, and the model went from recommending 48% of the catalog to 84%. That's 3,414 more movies the model recommended to at least one test user.

## The cost

![The trade in one chart: −4% accuracy on popular hits, +390% on niche long-tail films](/blog/assets/PopularityBias/accuracy_tradeoff.png)

This isn't free. Held-out viewings skew popular (that's what popularity bias is), so when you push popular movies down, some of those held-out movies get ranked a bit lower. Here are both models scored on the same ~100,000 held-out viewings:

| Overall ranking accuracy | α=0 | α=0.5 | |
|---|---:|---:|---|
| **MRR** | 0.120 | 0.115 | −4.3% |
| **Recall@10** | 0.230 | 0.220 | −4.4% |
| **NDCG@10** | 0.135 | 0.129 | −4.1% |

So about 4% worse overall. If you split it by how popular the held-out movie was, you can see where that loss comes from:

| MRR, split by how popular the held-out movie was | α=0 | α=0.5 | |
|---|---:|---:|---|
| **Popular head** (>1,000 ratings) | 0.124 | 0.119 | −4.7% |
| **Long tail** (≤1,000 ratings) | 0.0031 | 0.0152 | **+390%** |

All of the loss is on the popular head: the blockbusters the model already gets right, and that people barely need a recommender to find. The long tail gets 5–12× more accurate (tail Recall@10 goes from 0.2% to 3%). That's still low, but it's no longer hopeless, and the long tail is where a recommender is actually useful.

So the trade is giving up ~4% accuracy on movies everyone already knows, to make the rest of the catalog findable at all.

## What about people who like popular movies?

The obvious pushback on that −4.7% is: what about users whose taste really is mainstream, or who love a genre but mostly watch its recent, popular movies? Does α=0.5 push them into the long tail too?

No. I checked both models on exactly those users.

First, a pure blockbuster fan who only liked the big crowd-pleasers (*Avatar*, *Titanic*, *Jurassic Park*, *The Dark Knight*, *Inception*, *The Matrix* and so on, every one with over 27k ratings). The α=0.5 model recommends *Spider-Man*, *Batman Begins*, *Iron Man*, *The Incredibles*, *Minority Report* and *Harry Potter*, which are all still blockbusters. The median recommendation only moves from 42,700 to 38,700 ratings. If mainstream really is your taste, the model leaves you there.

![Pure-blockbuster fan: α=0 (left) vs α=0.5 (right). Both walls stay blockbusters, median recommendation 42,700 → 38,700 ratings, no collapse.](/blog/assets/PopularityBias/blockbuster_poster_board.png)

Second, a modern sci-fi fan: *Inception*, *Interstellar*, *Ex Machina*, *Arrival*, *District 9*, *Moon*. This person watches 2010s sci-fi, not 1950s sci-fi, and it's the case people usually expect α to break (by pushing them toward *Forbidden Planet* and *2001*), but it doesn't. α=0.5 cuts the median recommendation by 2.3× (15,100 to 6,500 ratings), but every pick is still modern sci-fi: *Oblivion*, *Prometheus*, *Sunshine*, *Primer*, *Coherence*, *Predestination*, all from 2004–2014. It just found less popular modern movies.

![Modern sci-fi fan: α=0 (left) vs α=0.5 (right). Every pick stays modern, on-genre sci-fi (2004–2014); α=0.5 surfaces deeper modern catalog, median 15,100 → 6,500 ratings.](/blog/assets/PopularityBias/modern_scifi_poster_board.png)

This is why doing it in the loss is better than a blunt post-filter. It discounts popularity relative to how well a movie matches you, so the movies you really match still score high. α=0.5 stops the model from pushing blockbusters on people who don't want them, but it doesn't take them away from people who do. I got the same result on every other profile I checked (modern superhero, Pixar-era animation, action, crime-thriller, post-2000 horror): each one stayed in recent, on-genre films.

## Takeaway

Usually 'fixing the recommender' means a bigger model, more features or more compute. This was one term in the loss function, backed by solid theory, and it:

- halved the popularity of recommendations
- nearly doubled catalog coverage
- made the long tail 5–12× more findable
- cost ~4% accuracy on the popular head and zero added latency

## Appendix: More examples

High-fantasy fan:

![High-fantasy fan: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/fantasy_poster_board.png)

Courtroom-drama fan:

![Courtroom-drama fan: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/courtroom_poster_board.png)

Organized-crime fan:

![Organized-crime fan: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/crime_poster_board.png)

1950s creature-feature fan:

![1950s creature-feature fan: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/creature_feature_poster_board.png)

Argento-Fulci giallo cultist:

![Argento-Fulci giallo cultist: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/giallo_poster_board.png)

1930s screwball-comedy fan:

![1930s screwball-comedy fan: α=0 (left) vs α=0.5 (right) recommendations](/blog/assets/PopularityBias/screwball_poster_board.png)
