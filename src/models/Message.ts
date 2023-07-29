import {z} from "zod";
import {IdSchema} from "./Id";
import {BasicUserSchema} from "./User";

export const CreateMessageSchema = z.object({
  message: z.string().min(1),
});

export const BasicMessageSchema = CreateMessageSchema.extend({
  id: IdSchema,
  postedAt: z.date(),
  groupId: IdSchema,
  userId: z.string(),
  user: BasicUserSchema,
});

export type CreateMessageType = z.infer<typeof CreateMessageSchema>;

export type BasicMessageType = z.infer<typeof BasicMessageSchema>;
