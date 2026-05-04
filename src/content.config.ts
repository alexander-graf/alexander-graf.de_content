import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
        loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
        schema: ({ image }) =>
                z.object({
                        title: z.string(),
                        description: z.string(),
                        pubDate: z.coerce.date(),
                        updatedDate: z.coerce.date().optional(),
                        heroImage: z.optional(image()),
                        tags: z.union([z.array(z.string()), z.string()]).transform(val => Array.isArray(val) ? val : [val]).default([]),
                }),
});

export const collections = { blog };
