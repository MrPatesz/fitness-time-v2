import {z} from "zod";
import {IdSchema} from "./Id";

export const CreateLocationSchema = z.object({
  address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const LocationSchema = CreateLocationSchema.extend({
  id: IdSchema,
});

export type CreateLocationType = z.infer<typeof CreateLocationSchema>;

export type LocationType = z.infer<typeof LocationSchema>;
