import {z} from "zod";
import {IdSchema} from "./Id";
import {BasicUserSchema} from "./User";

export const CreateGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

export const BasicGroupSchema = CreateGroupSchema.extend({
  id: IdSchema,
  createdAt: z.date(),
  creatorId: z.string(),
  creator: BasicUserSchema,
});

export const DetailedGroupSchema = BasicGroupSchema.extend({
  members: BasicUserSchema.array(),
  // events
  // posts
});

export type CreateGroupType = z.infer<typeof CreateGroupSchema>;

export type BasicGroupType = z.infer<typeof BasicGroupSchema>;

export type DetailedGroupType = z.infer<typeof DetailedGroupSchema>;