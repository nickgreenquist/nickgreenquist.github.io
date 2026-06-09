import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Stored as a plain "YYYY-MM-DD" string so URL/date handling never depends
    // on timezone-sensitive Date parsing (the old Jekyll permalinks are exact).
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    slug: z.string(),
    category: z.string(),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
