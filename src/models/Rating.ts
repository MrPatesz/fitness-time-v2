import {z} from 'zod';
import {IdSchema} from './Utils';

export const StarsSchema = z.number().min(0.5).max(5);

export const MutateRatingSchema = z.object({
  stars: StarsSchema,
});

export const BasicRatingSchema = MutateRatingSchema.extend({
  id: IdSchema,
  eventId: IdSchema,
  userId: z.string(),
});

export const AverageRatingSchema = z.object({
  count: z.number().int().nonnegative(),
  averageStars: StarsSchema.nullable(),
});

export type CreateRatingType = z.infer<typeof MutateRatingSchema>;

export type BasicRatingType = z.infer<typeof BasicRatingSchema>;

export type AverageRatingType = z.infer<typeof AverageRatingSchema>;
