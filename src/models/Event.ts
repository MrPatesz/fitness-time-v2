import {z} from "zod";
import {EventStatus} from "../utils/enums";
import {BasicCommentSchema} from "./Comment";
import {BasicGroupSchema} from "./Group";
import {IdSchema} from "./Id";
import {CreateLocationSchema, LocationSchema} from "./Location";
import {BasicUserSchema} from "./User";

export const CreateEventSchema = z.object({
  name: z.string().min(1),
  start: z.date(),
  end: z.date(),
  description: z.string(),
  limit: z.number().min(1).nullable(),
  price: z.number().min(1).nullable(),
  location: CreateLocationSchema,
  groupId: IdSchema.nullish(),
});

export const BasicEventSchema = CreateEventSchema.extend({
  id: IdSchema,
  creatorId: z.string(),
  creator: BasicUserSchema,
  locationId: IdSchema,
  location: LocationSchema,
  groupId: IdSchema.nullable(),
  group: BasicGroupSchema.nullable(),
  status: z.nativeEnum(EventStatus).optional(),
  distance: z.number().min(0).optional(),
}).transform((event) => ({
  ...event,
  status: event.start > new Date() ? EventStatus.PLANNED : EventStatus.ARCHIVE,
}));

export const DetailedEventSchema = BasicEventSchema.innerType().extend({
  participants: BasicUserSchema.array(),
  comments: BasicCommentSchema.array(),
}).transform((event) => ({
  ...event,
  status: event.start > new Date() ? EventStatus.PLANNED : EventStatus.ARCHIVE,
}));

export type CreateEventType = z.infer<typeof CreateEventSchema>;

export type BasicEventType = z.infer<typeof BasicEventSchema>;

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;
