import {z} from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  // location: LocationSchema.nullable(),
  introduction: z.string().nullable(),
  image: z.string().nullable(),
  email: z.string().nullable(),
  emailVerified: z.date().nullable(),
  // createdEvents: z.lazy(() => EventSchema.array()),
  // participatedEvents: z.lazy(() => EventSchema.array())
});

export type UserType = z.infer<typeof UserSchema>;