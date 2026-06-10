// The four recommenders shown on the home page and detailed on /projects.
export interface Project {
  label: string;
  dataset: string;
  items: string;
  users: string;
  result: string;
  demoHref: string;
  codeHref: string;
}

export const movie: Project = {
  label: 'Movie Recommender',
  dataset: 'MovieLens 32M',
  items: '9,375 movies',
  users: '~50k users',
  result: '8.7× MRR over the MSE baseline (0.115 vs 0.013)',
  demoHref: 'https://movie-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Movie-Recommender-System-PyTorch-TwoTower-Model',
};

export const book: Project = {
  label: 'Book Recommender',
  dataset: 'Goodreads',
  items: '14,753 books',
  users: '229k users',
  result: '3.4× Hit@10 over the MSE baseline (16.0% vs 4.7%)',
  demoHref: 'https://book-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Book-Recommender-System-PyTorch-TwoTower-Model',
};

export const steam: Project = {
  label: 'Steam Game Recommender',
  dataset: 'Steam Games Dataset',
  items: '5,437 games',
  users: '66k users',
  result: 'Wide & Deep ranker: +16% NDCG@10 over retrieval-only',
  demoHref: 'https://game-recommender-system-two-tower-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Game-Recommender-System-PyTorch-TwoTower-Model',
};

export const amazon: Project = {
  label: 'Amazon Games Recommender',
  dataset: 'Amazon Video Games',
  items: '16,882 games',
  users: '50,626 users',
  result: 'Sampled NDCG@10 0.519 — within 3.2% (relative) of published SASRec’s 0.536',
  demoHref: 'https://amazon-video-game-recommender-system-pytorch-transformer-model.streamlit.app/',
  codeHref: 'https://github.com/nickgreenquist/Amazon-Video-Game-Recommender-System-PyTorch-Transformer-Model',
};

export const streamlitNote =
  'These demos run on Streamlit’s free tier and sleep after a few hours of inactivity. If you land on a “Wake up” screen, just click the button — the app will be ready in about 15–30 seconds.';
