import {z} from 'zod';
import {IdSchema} from './Utils';

export const MutateLocationSchema = z.object({
  address: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const LocationSchema = MutateLocationSchema.extend({
  id: IdSchema,
});

export type CreateLocationType = z.infer<typeof MutateLocationSchema>;

export type LocationType = z.infer<typeof LocationSchema>;
