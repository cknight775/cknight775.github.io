import { z } from 'astro/zod';

export const reviewSchema = z
  .object({
    validation: z.enum(['draft', 'verified', 'approved']),
    visibility: z.enum(['private', 'preview', 'public']),
    status: z.enum(['draft', 'active', 'completed', 'obtained', 'in-progress']),
    opsec: z.enum(['not-required', 'pending', 'approved']),
    institutionalAuthorization: z.enum(['not-required', 'pending', 'approved']),
    sanitized: z.boolean(),
    verifiedLinks: z.array(
      z.object({
        label: z.string().min(1),
        url: z.url(),
      }),
    ),
    lastReviewed: z.coerce.date(),
  })
  .superRefine((review, context) => {
    if (review.visibility !== 'public') return;

    const validGate = (value: string) =>
      value === 'approved' || value === 'not-required';

    if (review.validation !== 'approved') {
      context.addIssue({
        code: 'custom',
        message: 'Public content requires validation=approved.',
        path: ['validation'],
      });
    }
    if (!review.sanitized) {
      context.addIssue({
        code: 'custom',
        message: 'Public content requires sanitized=true.',
        path: ['sanitized'],
      });
    }
    if (!validGate(review.opsec)) {
      context.addIssue({
        code: 'custom',
        message: 'Public content requires OPSEC approved or not-required.',
        path: ['opsec'],
      });
    }
    if (!validGate(review.institutionalAuthorization)) {
      context.addIssue({
        code: 'custom',
        message:
          'Public content requires institutional authorization approved or not-required.',
        path: ['institutionalAuthorization'],
      });
    }
  });

export type ReviewState = z.infer<typeof reviewSchema>;

export function isVisibleContent(review: ReviewState, previewEnabled: boolean) {
  if (review.visibility === 'public') return true;
  return previewEnabled && review.visibility === 'preview';
}
