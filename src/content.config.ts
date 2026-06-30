import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
  .transform((value) => new Date(`${value}T00:00:00Z`));

const blog = defineCollection({
  loader: glob({
    base: './src/content/writing',
    pattern: ['**/*.{md,mdx}', '!drafts/**'],
  }),
  // Type-check frontmatter using a schema
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional().default([]),
      publishedAt: isoDate,
      updatedAt: isoDate.optional(),
      heroImage: z.optional(image()),
      author: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.optional(image()),
      postId: z.string(),
    }),
});

export const collections = { blog };
