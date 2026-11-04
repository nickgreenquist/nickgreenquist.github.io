---
title: "Building an LLM-Powered Search and Discovery Experience for a Movie Recommender"
description: "I put a small LLM in front of my two-tower movie recommender, so you can describe what you want to watch in your own words and the recommender does the rest."
date: "2026-07-12"
slug: "llm-search-discovery-movie-recommender"
category: projects
image: "/blog/assets/AskTabLLM/fig1_landing.png"
---

> TL;DR: I put a small LLM (Claude Haiku) in front of my two-tower movie recommender. You describe what you want in your own words, the LLM turns it into a structured query, and the recommender does the actual retrieval and ranking.

## Background
Netflix is beta-testing a natural-language search that turns something like "something funny and upbeat" into a list of titles you can refine (type more into the same box and it narrows the results, you don't start over). Spotify's AI playlists take a sentence like "science explainers for my morning run" and give you back a queue, weighed against your listening history unless you tell it not to. In both, the LLM only turns what you typed into a query. The recommender that was already there still decides what comes back.

I wanted to try the same thing with my movie recommender.

## Why not just use an LLM?
You could ask ChatGPT or Gemini for "movies like Rashomon" and get a good answer, but only because they've already read IMDb and Letterboxd. That makes movies an easy demo (the results are easy to check) but not a realistic one. A real recommender runs over a company's own catalog: millions of items the LLM has never seen, and way too many to fit in a context window. So here the LLM only works out what the user wants, and a retrieval model trained on the catalog does the matching.

Fine-tuning an LLM on the catalog doesn't really fix this either. Generative recommenders that output item names directly can hallucinate titles that aren't in the catalog, and they cost a lot more to serve. Indeed's fine-tuned GPT-3.5 recommender took [6.7 seconds per inference](https://eugeneyan.com/writing/recsys-llm/), which was too slow to put online, so they replaced it with a lightweight classifier in production. [Spotify's own generative-retrieval research](https://research.atspotify.com/2024/10/bridging-search-and-recommendation-with-generative-retrieval) found it consistently lagged specialized baselines like SASRec and BERT4Rec. My guess is that text similarity alone doesn't capture collaborative-filtering signal.

## Who it's for
The first case is cold start. Most recommenders need weeks of clicks before they're any good. My model was built to skip that: a handful of liked movies is enough, with no retraining and no user-ID lookup. And typing in a few movies you liked is exactly what a chat box is good for.

The second case is a user who already has a history but wants something outside it. "Something to watch with my nephew this weekend" or "movies like Rashomon but not so bleak" won't show up in a For You row, and there's no title to type into a search bar. In the Ask tab you just describe it and get a board of movies back.

From a business point of view:

- New users: a good result on day one instead of after weeks of clicks, which cuts churn.
- High-intent users: they know what they want but can't name a title, so the search bar fails them. A sentence is enough for Ask.
- Explainability: the extraction already exists, so showing it back to the user costs nothing.
- Fuzzy input: misspellings, half-remembered titles, "I don't know exactly what I want."
- Steering: users can push the results where they want without waiting for the algorithm to catch on.

## How it works
A small hosted LLM sits in front of a trained two-tower movie recommender. You type something like "classic samurai films full of sword duels and honor" or "movies directed by Akira Kurosawa, like Rashomon, Ran, and Ikiru", and Claude Haiku fills in one structured object behind the scenes: liked titles, genres, people, mood, and hard constraints like a year range or a minimum rating. A deterministic pipeline then turns that object into weighted movie anchors, hard filters and re-rank terms. The trained model does all the retrieval and scoring. Nothing generative touches the ranking.

I tuned the prompt and the resolution logic on 500 synthetic queries (generated to look like what a user would type) plus my own manual testing. That took the 'good board' rate from 32.0% to 50.8%, where a 'good board' is one that an LLM judge and my own review both agreed matched what the query asked for.

<p align="center">
  <img src="/blog/assets/AskTabLLM/fig1_landing.png" alt="The Ask tab: a chat-style search bar, a row of theme pills, a second row of related pills once a theme is open, and a results grid below" width="820">
</p>

*Click the suggested prompt "Samurai duels & honor" and a board of samurai films shows up below (Seven Samurai, Yojimbo, Musashi Miyamoto, Rashomon, Throne of Blood). The click also opens a second row, "Riffing on: Samurai duels & honor," with six related pills including "Directed by Kurosawa."*

## The LLM never ranks anything
An LLM can't rank a catalog of thousands of movies by itself. It can't reliably score anything beyond the few titles it can name, and there's no guarantee the titles it lists are even in the corpus. So I never ask it to. Its text never reaches the user either: there's no AI-written answer or chatbot reply anywhere in the app. The LLM's job ends once the structured object is filled in, and everything after that is the recommender. You can check this yourself with the "Show raw extraction" toggle:

<p align="center">
  <img src="/blog/assets/AskTabLLM/fig3_raw_extraction.png" alt="The Ask tab's debug expander open, showing the LLM's actual structured JSON output for a query about films directed by Akira Kurosawa" width="820">
</p>

*"Under the hood," normally collapsed. `liked_items` resolved to exact titles with years, and a nested `hard_constraints.require_people` field has the director's name. This is the whole LLM output for the query above: tool-call arguments, no prose.*

## Cost
Each live query is one Haiku call: about 12k tokens of system prompt and schema, a short user query, and up to 300 tokens back. At Haiku 4.5's list price (\$1/M input tokens, \$5/M output tokens), a cold call with no cache hit costs about \$0.017. A warm call hits the 5-minute prompt cache on that 12k-token prefix and costs about \$0.003, roughly 6x cheaper (a cache read is a tenth of the normal input price, and writing the cache costs a one-time 1.25x premium). With the rate caps (20 queries per session, 60 per day across all visitors), the worst case where every call misses the cache is about \$1/day for the whole public demo, and caching keeps it well under that.

At product scale it's a different story. 10k daily users sending a couple of free-text queries each is 20k calls a day, or \$2k-\$10k a month depending on the cache hit rate. At that point it's worth skipping the call whenever you can. Semantic caching (GPTCache, Redis LangCache) catches near-duplicate queries and reuses the earlier extraction instead of calling the model again. You could also mine the query logs and pre-resolve the most common queries into that same cache, which basically turns the demo's hand-picked pills into a lookup table nobody has to maintain.

## What I learned
- Few-shot examples worked better than more instructions. One keyword-routing bug survived every rule I wrote for it, then went away once I added worked examples to the prompt.
- Extended thinking didn't help. Filling in a schema is a narrow extraction task, so I used forced tool use with thinking off. It's cheaper and I never saw it hurt accuracy.
- Haiku seems to be enough, but I never tested a bigger model head-to-head. My reasoning is that the task is filling in a schema (not long chain-of-thought), and Haiku is roughly 3x cheaper than Sonnet and 5x cheaper than Opus at list price.
- The metadata matters more than the model. Person, studio and keyword filters only work because there's a scraped metadata table for the LLM's output to match against. Before I had those tables, a request like "directed by Kurosawa" had nothing to match, and the extraction just silently dropped it and answered the rest of the query.
- Some queries still fail. Named titles, directors, genres and concrete themes ("chess", "heist", "time loop") work reliably. Mood-only requests, places like "movies set in Rome", and very niche keywords don't. If a keyword only matches a few films in the whole corpus, all of them show up whether they fit or not, because there's nothing else to rank.

## More examples
Here are six of the theme pills, each paired with one of the related pills it opens. Expand any of them to see the prompt and the top 5 posters:

<details>
<summary><strong>Anime, Ghibli to Akira</strong></summary>

Prompt: "Breathtaking anime films, from Studio Ghibli's warmth to the neon chaos of Akira and Ghost in the Shell."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/bLUUr474Go1DfeN1HLjE3rnZXBq.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/cMYCDADoLKLbB83g4WnJegaZimC.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/41XxSsJc5OrulP0m7TrrUeO2hoz.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/1ZJRbLDVr90KLtKdmTT4WZhT26E.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/41WtqvaObaYE3RuqgBfQFPV3aV1.jpg" width="90">
</p>

Top 5: Paprika (Papurika) (2006), Princess Mononoke (Mononoke-hime) (1997), Laputa: Castle in the Sky (Tenkû no shiro Rapyuta) (1986), Ghost in the Shell 2: Innocence (a.k.a. Innocence) (Inosensu) (2004), Metropolis (2001)

</details>

<details>
<summary><strong>Studio Ghibli classics</strong></summary>

Prompt: "Studio Ghibli movies like Spirited Away and My Neighbor Totoro."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/41XxSsJc5OrulP0m7TrrUeO2hoz.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/tcrkfB8SRPQCgwI88hQScua6nxh.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/cMYCDADoLKLbB83g4WnJegaZimC.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/13kOl2v0nD2OLbVSHnHk8GUFEhO.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/Aufa4YdZIv4AXpR9rznwVA5SEfd.jpg" width="90">
</p>

Top 5: Laputa: Castle in the Sky (Tenkû no shiro Rapyuta) (1986), Nausicaä of the Valley of the Wind (Kaze no tani no Naushika) (1984), Princess Mononoke (Mononoke-hime) (1997), Howl's Moving Castle (Hauru no ugoku shiro) (2004), Kiki's Delivery Service (Majo no takkyûbin) (1989)

</details>

<details>
<summary><strong>Christmas by the tree</strong></summary>

Prompt: "Cozy Christmas movies to watch by the tree."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/oOleziEempUPu96jkGs0Pj6tKxj.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/34nSHYqmb7222tiqiuKqKJmZiQa.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/2sMpffmvoJlW7WBcvyHTPR9DEsj.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/yF7SNheAGWavNnjbAronedwjC1N.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/7ir0iRuPK9OEuH569cp0nF5CJce.jpg" width="90">
</p>

Top 5: Elf (2003), A Christmas Story (1983), The Bishop's Wife (1947), Arthur Christmas (2011), How the Grinch Stole Christmas! (1966)

</details>

<details>
<summary><strong>Starring Santa himself</strong></summary>

Prompt: "Christmas movies where Santa Claus is a main character."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/g3JfCGX9fgHwmmKFhRzu7BYc29d.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/tZvGQF2623FD0MZgvOy18J5d7x5.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/9hTYFvEDnajUIbpdfc3fO6bZq2Y.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/hvV2rI60qOYELT7tHHLpxtafnBZ.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/pvaWMSRzRwtcxyHKNLX6phiQp8d.jpg" width="90">
</p>

Top 5: Prancer (1989), Santa Claus: The Movie (1985), I'll Be Home For Christmas (1998), The Santa Clause (1994), The Santa Clause 3: The Escape Clause (2006)

</details>

<details>
<summary><strong>Make me sob</strong></summary>

Prompt: "A devastating drama that will absolutely make me sob."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/qKnsyaJZLXfiL2JhIJEkpA8C3LU.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/jJiGGbuLW8IkEnh5073maEmIr7V.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/o9VXYOuaJxCEKOxbA86xqtwmqYn.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/yAhoeIwwtPxJ7uf9HLIMHIqWFnL.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/1ONOsIo5gby9hABPdknL7OAYBLm.jpg" width="90">
</p>

Top 5: Short Term 12 (2013), Still Alice (2014), Manchester by the Sea (2016), The Good Lie (2014), Wit (2001)

</details>

<details>
<summary><strong>Dogs that break your heart</strong></summary>

Prompt: "Emotional dramas about the bond between a person and their dog, like Hachi: A Dog's Story and My Dog Skip. No comedies."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/Xe7AB0ffhGPSdBZ4qJ9AKJfllL.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/5I7SYsNQmZRZpQ2MAarIQYU9vaX.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/wRB0cTPBIWHEq4FmWuX6voagePf.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/A4lH22nlFF7MdalGfcvSrlC1ttt.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/cVtF8SW4zMbculTXD52RDvmQAAR.jpg" width="90">
</p>

Top 5: Old Yeller (1957), Umberto D. (1952), Shiloh (1997), Amores Perros (Love's a Bitch) (2000), Wendy and Lucy (2008)

</details>

<details>
<summary><strong>Samurai duels & honor</strong></summary>

Prompt: "Classic samurai films full of sword duels and honor."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/tN7kYPjRhDolpui9sc9Eq9n5b2O.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/2nCSzKqOslKrsvUHb2T1jsuh2eQ.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/vL7Xw04nFMHwnvXRFCmYYAzMUvY.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/zaZFMNxJST0TtPd68yF7fNt1he8.jpg" width="90">
</p>

Top 5: Seven Samurai (Shichinin no samurai) (1954), Yojimbo (1961), Samurai I: Musashi Miyamoto (Miyamoto Musashi) (1954), Rashomon (Rashômon) (1950), Throne of Blood (Kumonosu jô) (1957)

</details>

<details>
<summary><strong>Directed by Kurosawa</strong></summary>

Prompt: "Movies directed by Akira Kurosawa, like Rashomon, Ran, and Ikiru."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/zaZFMNxJST0TtPd68yF7fNt1he8.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/tN7kYPjRhDolpui9sc9Eq9n5b2O.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/zW47oIH3bc3ggmmmzTvKqM4Fqjk.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/iYNH3Re0JSypoYaWvZtERUnNaJL.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/fJgqj9s8HNZz9zwX6femVJn8HEB.jpg" width="90">
</p>

Top 5: Throne of Blood (Kumonosu jô) (1957), Yojimbo (1961), Sanjuro (Tsubaki Sanjûrô) (1962), Red Beard (Akahige) (1965), Kagemusha (1980)

</details>

<details>
<summary><strong>Nothing but time travel</strong></summary>

Prompt: "Movies where time travel is the whole point, like Back to the Future and Primer."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/hQq8xZe5uLjFzSBt4LanNP7SQjl.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/crzoVQnMzIrRfHtQw0tLBirNfVg.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/r67KzlHkdiwe3fBWzImEkNOg1Y.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/zdxQRP7mzczMJBwKnv8MCPRq7rQ.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/38Xr1JnV1ZcLQ55zmdSp6n475cZ.jpg" width="90">
</p>

Top 5: Back to the Future Part II (1989), Back to the Future Part III (1990), Frequently Asked Questions About Time Travel (2009), Timecrimes (Cronocrímenes, Los) (2007), Predestination (2014)

</details>

<details>
<summary><strong>Stuck in a time loop</strong></summary>

Prompt: "Groundhog Day-style time loops, like Edge of Tomorrow."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/nTr0lvAzeQmUjgSgDEHTJpnrxTz.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/mU4VeXVK18JtCZsy7i0zczlA9p7.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/cRlMrbc4Iof7vN0ZqHwJnMBYBLi.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/eowzonDJMCuNXoJGVkP9Z7oCmiM.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/wGHoYDswvx96PVF43qFErVAnQHS.jpg" width="90">
</p>

Top 5: Source Code (2011), ARQ (2016), Triangle (2009), Before I Fall (2017), Synchronicity (2015)

</details>

<details>
<summary><strong>Gritty pre-2000 New York</strong></summary>

Prompt: "Gritty New York City movies from before 2000, no musicals."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/rex4oaiSCD8UQg9204R6hQcFrX9.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/vNhywp9w1DVG6BytxKp4kjtaaGC.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/d6YZpBq4BhQr1K985J3CuL1cA8J.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/ckklq45UxUkwgHve9xItXqXr06r.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/1MyH4MJAJZJbb6wDVeOc2bTECtK.jpg" width="90">
</p>

Top 5: The Naked City (1948), The Taking of Pelham One Two Three (1974), The Warriors (1979), Midnight Cowboy (1969), King of New York (1990)

</details>

<details>
<summary><strong>Scorsese's New York</strong></summary>

Prompt: "Martin Scorsese's New York movies."

<p align="center" class="poster-row">
<img src="https://image.tmdb.org/t/p/w342/1nD40aUcPAxYdE1WxERrTjZuFGe.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/eamOBurHBu0MIxohTIVcfxmZ6Z7.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/ekstpH614fwDX8DUln1a2Opz0N8.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/9msfwOeGc9uL1iRRTBdEf15XonC.jpg" width="90"> <img src="https://image.tmdb.org/t/p/w342/mViGEH5dfsAnUgJmce1RJkFycAi.jpg" width="90">
</p>

Top 5: New York, New York (1977), After Hours (1985), Taxi Driver (1976), Mean Streets (1973), New York Stories (1989)

</details>

## Try it
You can [try it in the Ask tab of the live demo](https://movie-recommender-system-two-tower-model.streamlit.app/). For more on how it works (the schema, the resolution pipeline, and why the LLM's output is kept hidden), see the About tab in the app or the [GitHub README](https://github.com/nickgreenquist/Movie-Recommender-System-PyTorch-TwoTower-Model).
