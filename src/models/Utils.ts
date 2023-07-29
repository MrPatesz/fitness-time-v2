import {z} from "zod";

export const IdSchema = z.number().min(1);

export const NameSchema = z.string().trim().min(1).max(64);

export const TextSchema = z.string().trim().min(1).max(512);

export const DescriptionSchema = z.string().trim().max(1024);
