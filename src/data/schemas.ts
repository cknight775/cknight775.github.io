import { z } from 'astro/zod';
import { reviewSchema } from './publication';

const linkSchema = z.object({
  github: z.url(),
  linkedin: z.url(),
  credly: z.url(),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  eyebrow: z.string().min(1),
  positioning: z.string().min(1),
  summary: z.string().min(1),
  location: z.string().min(1),
  email: z.email(),
  links: linkSchema,
  metrics: z.array(
    z.object({ value: z.string().min(1), label: z.string().min(1) }),
  ),
  status: z.string().min(1),
  review: reviewSchema,
});

export const educationSchema = z.object({
  program: z.string().min(1),
  institution: z.string().min(1),
  period: z.string().min(1),
  review: reviewSchema,
});

export const credentialSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  year: z.number().int(),
  review: reviewSchema,
});

export const trainingSchema = credentialSchema.extend({
  review: reviewSchema.refine((review) => review.status === 'in-progress', {
    message: 'Complementary training must use status=in-progress.',
  }),
});
