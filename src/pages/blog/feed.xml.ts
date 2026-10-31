import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { postPath, byNewest } from '../../utils/blog';

const SITE = 'https://nickgreenquist.com';

export async function GET(_context: APIContext) {
  const posts = (await getCollection('blog')).sort(byNewest);
  return rss({
    title: 'Nick Greenquist',
    description: 'Writing on machine learning, recommender systems, and software projects.',
    site: SITE,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? '',
      // Midday UTC keeps the calendar date stable regardless of reader timezone.
      pubDate: new Date(`${post.data.date}T12:00:00Z`),
      link: `${SITE}${postPath(post)}`,
    })),
  });
}
