import {z} from "zod";
import {IdSchema} from "./Id";
import {UserSchema} from "./User";

const CreateGroupSchema = z.object({
  name: z.string().min(1),
});

const GroupSchema = CreateGroupSchema.merge(z.object({
  id: IdSchema,
  ownerId: z.number(),
  owner: UserSchema,
}));

export type CreateGroupType = z.infer<typeof CreateGroupSchema>;

export type GroupType = z.infer<typeof GroupSchema>;