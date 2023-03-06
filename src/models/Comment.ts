import {z} from "zod";
import {IdSchema} from "./Id";
import {BasicUserSchema} from "./User";

export const CreateCommentSchema = z.object({
  message: z.string().min(1),
});

export const BasicCommentSchema = CreateCommentSchema.extend({
  id: IdSchema,
  postedAt: z.date(),
  eventId: IdSchema,
  userId: z.string(),
  user: BasicUserSchema,
});

export type CreateCommentType = z.infer<typeof CreateCommentSchema>;

export type BasicCommentType = z.infer<typeof BasicCommentSchema>;