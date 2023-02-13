import {z} from "zod";
import {UserSchema} from "./User";
import {IdSchema} from "./Id";

export const CreateEventSchema = z.object({
  name: z.string().min(1),
  start: z.date(),
  end: z.date(),
  // location: LocationSchema,
  // recurring: z.boolean(),
  description: z.string().nullable(),
  equipment: z.string().nullable(),
  limit: z.number().min(1).nullable(),
  price: z.number().min(1).nullable(),
});

export const EventSchema = CreateEventSchema.merge(z.object({
  id: IdSchema,
  ownedByCaller: z.boolean(),
  ownerId: z.number(),
  owner: UserSchema,
  participants: z.lazy(() => UserSchema.array()),
}));

export type CreateEventType = z.infer<typeof CreateEventSchema>;

export type EventType = z.infer<typeof EventSchema>;
