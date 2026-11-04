// The projects shown in the home page's Projects section.
export interface Project {
  emoji: string;
  shortLabel: string;
  arch: string;
  demoHref: string;
  codeHref: string;
}

export const movie: Project = {
  emoji: '🎬',
  shortLabel: 'Movies',
  arch: 'Two-tower retrieval + LLM search',
  demoHref: 'https://movie-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Movie-Recommender-System-PyTorch-TwoTower-Model',
};

export const book: Project = {
  emoji: '📚',
  shortLabel: 'Books',
  arch: 'Two-tower retrieval',
  demoHref: 'https://book-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Book-Recommender-System-PyTorch-TwoTower-Model',
};

export const steam: Project = {
  emoji: '🎮',
  shortLabel: 'Steam Games',
  arch: 'Two-tower retrieval + Ranker',
  demoHref: 'https://game-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Game-Recommender-System-PyTorch-TwoTower-Model',
};

export const amazon: Project = {
  emoji: '🕹️',
  shortLabel: 'Amazon Games',
  arch: 'Sequential Transformer',
  demoHref: 'https://amazon-video-game-recommender-system-pytorch-transformer-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Amazon-Video-Game-Recommender-System-PyTorch-Transformer-Model',
};

// MissingNo.Zero has no live demo; its write-up is the blog post, resolved
// from this slug on the home page so the URL can't drift.
export const missingno = {
  shortLabel: 'MissingNo.Zero',
  arch: 'Self-play RL agent for Pokémon Showdown. Hit #1 on the random-battle ladder in five generations.',
  postSlug: 'missingno-zero-self-play-pokemon-showdown',
  codeHref: 'https://github.com/nickgreenquist/missingno-zero',
};
