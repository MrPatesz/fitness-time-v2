import {z} from 'zod';

export const IdSchema = z.number().min(1);

export const NameSchema = z.string().trim().min(1).max(64);

export const TextSchema = z.string().trim().min(1).max(512);

export const DescriptionSchema = z.string().trim().max(1024);

export const ImageSchema = z.union([
  z.string().trim().max(256).url(),
  z.string().trim().length(0),
]);
