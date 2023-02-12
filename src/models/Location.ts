import {z} from "zod";

export const LocationSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  address: z.string(),
});

export type LocationType = z.infer<typeof LocationSchema>;