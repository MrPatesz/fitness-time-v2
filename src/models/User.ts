import {z} from "zod";
import {BasicEventSchema} from "./Event";
import {LocationSchema} from "./Location";

export const BasicUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  introduction: z.string().nullable(),
  image: z.string().nullable(),
  // email: z.string().nullable(), TODO
  // emailVerified: z.date().nullable(),
});

export const UpdateProfileSchema = BasicUserSchema.extend({
  location: LocationSchema.nullable(),
});

export const DetailedUserSchema = BasicUserSchema.extend({
  createdEvents: z.lazy(() => BasicEventSchema.array()),
  participatedEvents: z.lazy(() => BasicEventSchema.array()),
});

export const ProfileSchema = DetailedUserSchema.extend({
  location: LocationSchema.nullable(),
});

export type BasicUserType = z.infer<typeof BasicUserSchema>;

export type DetailedUserType = z.infer<typeof DetailedUserSchema>;

export type ProfileType = z.infer<typeof ProfileSchema>;

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;
