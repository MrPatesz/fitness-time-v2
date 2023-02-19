import {z} from "zod";
import {IdSchema} from "./Id";
import {CreateLocationSchema, LocationSchema} from "./Location";
import {BasicUserSchema} from "./User";

// TODO status: planned, archive

export const CreateEventSchema = z.object({
  name: z.string().min(1),
  start: z.date(),
  end: z.date(),
  // recurring: z.boolean(),
  description: z.string(),
  equipment: z.string(),
  limit: z.number().min(1).nullable(),
  price: z.number().min(1).nullable(),
  location: CreateLocationSchema,
});

export const BasicEventSchema = CreateEventSchema.extend({
  id: IdSchema,
  creatorId: z.string(),
  creator: BasicUserSchema,
  locationId: IdSchema,
  location: LocationSchema,
});

export const DetailedEventSchema = BasicEventSchema.extend({
  participants: BasicUserSchema.array(),
});

export type CreateEventType = z.infer<typeof CreateEventSchema>;

export type BasicEventType = z.infer<typeof BasicEventSchema>;

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;
