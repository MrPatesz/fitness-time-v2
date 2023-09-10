import {z} from 'zod';
import {BasicUserSchema} from './User';
import {DescriptionSchema, IdSchema, NameSchema} from './Utils';

export const MutateGroupSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema,
});

export const BasicGroupSchema = MutateGroupSchema.extend({
  id: IdSchema,
  createdAt: z.date(),
  creatorId: z.string(),
  creator: BasicUserSchema,
});

export const DetailedGroupSchema = BasicGroupSchema.extend({
  members: z.lazy(() => BasicUserSchema.array()),
});

export type CreateGroupType = z.infer<typeof MutateGroupSchema>;

export type BasicGroupType = z.infer<typeof BasicGroupSchema>;

export type DetailedGroupType = z.infer<typeof DetailedGroupSchema>;
