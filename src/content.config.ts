import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { reviewSchema } from './data/publication';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    order: z.number().int().positive(),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    period: z.string().min(1),
    status: z.enum(['active', 'completed', 'archived']),
    context: z.string().min(1),
    role: z.string().min(1),
    approach: z.array(z.string().min(1)).min(1),
    outcome: z.string().min(1),
    technologies: z.array(z.string().min(1)).min(1),
    publicLinks: z
      .array(z.object({ label: z.string().min(1), url: z.url() }))
      .optional(),
    evidence: z
      .array(
        z.object({
          src: z.string().min(1),
          alt: z.string().min(1),
          width: z.number().int().positive(),
          height: z.number().int().positive(),
        }),
      )
      .optional(),
    notice: z.string().min(1),
    review: reviewSchema,
  }),
});

export const collections = { projects };
