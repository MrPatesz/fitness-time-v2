import {z} from "zod";
import {BasicEventSchema} from "./Event";

export const BasicUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  // location: LocationSchema.nullable(),
  introduction: z.string().nullable(),
  image: z.string().nullable(),
  // email: z.string().nullable(), TODO
  // emailVerified: z.date().nullable(),
});

export const DetailedUserSchema = BasicUserSchema.extend({
  createdEvents: z.lazy(() => BasicEventSchema.array()),
  participatedEvents: z.lazy(() => BasicEventSchema.array()),
});

export type BasicUserType = z.infer<typeof BasicUserSchema>;

export type DetailedUserType = z.infer<typeof DetailedUserSchema>;
