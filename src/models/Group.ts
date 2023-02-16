import {z} from "zod";
import {IdSchema} from "./Id";
import {BasicUserSchema} from "./User";

const CreateGroupSchema = z.object({
  name: z.string().min(1),
});

const GroupSchema = CreateGroupSchema.merge(z.object({
  id: IdSchema,
  creatorId: z.number(),
  creator: BasicUserSchema,
  members: BasicUserSchema.array(),
  // events
  // posts
}));

export type CreateGroupType = z.infer<typeof CreateGroupSchema>;

export type GroupType = z.infer<typeof GroupSchema>;