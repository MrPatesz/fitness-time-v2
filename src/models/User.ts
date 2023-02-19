import {z} from "zod";
import {BasicEventSchema} from "./Event";
import {CreateLocationSchema, LocationSchema} from "./Location";

enum Colors {
  DARK = "dark",
  GRAY = "gray",
  RED = "red",
  PINK = "pink",
  GRAPE = "grape",
  VIOLET = "violet",
  INDIGO = "indigo",
  BLUE = "blue",
  CYAN = "cyan",
  TEAL = "teal",
  GREEN = "green",
  LIME = "lime",
  YELLOW = "yellow",
  ORANGE = "orange",
}

export const BasicUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  introduction: z.string().nullable(), // TODO should not be nullable (same with all string properties)
  image: z.string().nullable(),
  // TODO color: z.string().nullable(),
});

export const DetailedUserSchema = BasicUserSchema.extend({
  createdEvents: z.lazy(() => BasicEventSchema.array()),
  participatedEvents: z.lazy(() => BasicEventSchema.array()),
});

export const UpdateProfileSchema = BasicUserSchema.extend({
  location: CreateLocationSchema.nullable(),
});

export const ProfileSchema = BasicUserSchema.extend({
  location: LocationSchema.nullable(),
  // email: z.string().nullable(),
  // emailVerified: z.date().nullable(),
});

export type BasicUserType = z.infer<typeof BasicUserSchema>;

export type DetailedUserType = z.infer<typeof DetailedUserSchema>;

export type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;

export type ProfileType = z.infer<typeof ProfileSchema>;
