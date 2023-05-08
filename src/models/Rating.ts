import {z} from "zod";
import {IdSchema} from "./Id";
import {BasicUserSchema} from "./user/User";

export const StarsSchema = z.number().min(0.5).max(5);

export const CreateRatingSchema = z.object({
  stars: StarsSchema,
});

export const BasicRatingSchema = CreateRatingSchema.extend({
  id: IdSchema,
  eventId: IdSchema,
  userId: z.string(),
  user: BasicUserSchema,
});

export const AverageRatingSchema = z.object({
  count: z.number().min(0),
  averageStars: StarsSchema.nullable(),
});

export type CreateRatingType = z.infer<typeof CreateRatingSchema>;

export type BasicRatingType = z.infer<typeof BasicRatingSchema>;

export type AverageRatingType = z.infer<typeof AverageRatingSchema>;
