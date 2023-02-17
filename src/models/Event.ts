import {z} from "zod";
import {BasicUserSchema} from "./User";
import {IdSchema} from "./Id";

// TODO status: planned, archive
//  createdByCaller

export const CreateEventSchema = z.object({
  name: z.string().min(1),
  start: z.date(),
  end: z.date(),
  // location: LocationSchema,
  // recurring: z.boolean(),
  description: z.string(),
  equipment: z.string(),
  limit: z.number().min(1).nullable(),
  price: z.number().min(1).nullable(),
});

export const BasicEventSchema = CreateEventSchema.extend({
  id: IdSchema,
  creatorId: z.string(),
  // ownedByCaller: z.boolean(),
});

export const DetailedEventSchema = BasicEventSchema.extend({
  creator: BasicUserSchema,
  participants: BasicUserSchema.array(),
});

export type CreateEventType = z.infer<typeof CreateEventSchema>;

export type BasicEventType = z.infer<typeof BasicEventSchema>;

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;
