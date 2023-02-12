import {z} from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(1),
  introduction: z.string().nullable(),
  // ownedEvents: z.lazy(() => z.array(EventSchema).nullable()),
});

export type User = z.infer<typeof UserSchema>;