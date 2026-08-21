import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const reviewState = z.enum(['draft', 'verified', 'approved']);
const visibilityState = z.enum(['private', 'preview', 'public']);
const opsecState = z.enum(['not-required', 'pending', 'approved']);
const authorizationState = z.enum(['not-required', 'pending', 'approved']);

const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: z.object({
    order: z.number().int().positive(),
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    context: z.string().min(1),
    role: z.string().min(1),
    approach: z.array(z.string().min(1)).min(1),
    technologies: z.array(z.string().min(1)).min(1),
    notice: z.string().min(1),
    review: z.object({
      validation: reviewState,
      visibility: visibilityState,
      opsec: opsecState,
      institutionalAuthorization: authorizationState,
      sanitized: z.boolean(),
      lastReviewed: z.coerce.date(),
    }),
  }),
});

export const collections = { projects };
