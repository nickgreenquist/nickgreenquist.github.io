import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Canonical URL for a post. Mirrors the original Jekyll permalink
 * (`/blog/:category/:yyyy/:mm/:dd/:slug/`) so old links keep resolving.
 */
export function postPath(post: Post): string {
  const [y, m, d] = post.data.date.split('-');
  return `/blog/${post.data.category}/${y}/${m}/${d}/${post.data.slug}/`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** "2018-04-10" -> "April 10, 2018" (no Date object, so no timezone drift). */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** Sort comparator: newest first. ISO date strings sort lexicographically. */
export function byNewest(a: Post, b: Post): number {
  return b.data.date.localeCompare(a.data.date);
}

const CATEGORY_LABELS: Record<string, string> = {
  datascience: 'Data Science',
  projects: 'Projects',
  miscl: 'Misc',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
