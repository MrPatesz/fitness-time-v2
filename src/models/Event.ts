import {z} from 'zod';
import {EventStatus} from '../utils/enums';
import {BasicGroupSchema} from './Group';
import {LocationSchema, MutateLocationSchema} from './Location';
import {BasicUserSchema} from './User';
import {DescriptionSchema, IdSchema, NameSchema} from './Utils';

export const IntervalSchema = z.object({
  start: z.date(),
  end: z.date(),
}).refine(interval => interval.start < interval.end, {
  message: 'Interval must start before it ends',
});

// TODO IntervalSchema.extend
export const MutateEventSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema,
  start: z.date(),
  end: z.date(),
  limit: z.number().min(2).nullable(),
  price: z.number().min(1).nullable(),
  location: MutateLocationSchema,
  groupId: IdSchema.nullish(),
}).refine(event => new Date() < event.start, {
  message: 'Event must not start in the past',
}).refine(event => event.start < event.end, {
  message: 'Event must start before it ends',
});

export const BasicEventSchema = MutateEventSchema.innerType().innerType().extend({
  id: IdSchema,
  creatorId: z.string(),
  creator: BasicUserSchema,
  locationId: IdSchema,
  location: LocationSchema,
  groupId: IdSchema.nullable(),
  group: BasicGroupSchema.nullable(),
  status: z.nativeEnum(EventStatus).optional(),
  distance: z.number().nonnegative().optional(),
}).transform((event) => ({
  ...event,
  status: event.start > new Date() ? EventStatus.PLANNED : EventStatus.ARCHIVE,
}));

export const EventWithLocationSchema = BasicEventSchema
  .innerType()
  .omit({creator: true, group: true});

export const DetailedEventSchema = BasicEventSchema.and(z.object({
  participants: BasicUserSchema.array(),
}));

export type CreateEventType = z.infer<typeof MutateEventSchema>;

export type BasicEventType = z.infer<typeof BasicEventSchema>;

export type DetailedEventType = z.infer<typeof DetailedEventSchema>;

export type EventWithLocationType = z.infer<typeof EventWithLocationSchema>;
