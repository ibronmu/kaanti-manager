import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2),
  phone: z.string().min(7).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const businessOnboardingSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  type: z.string().min(2),
  location: z.string().min(2),
  phone: z.string().min(7),
  preferredLanguage: z.enum(["en", "ha"]).default("en"),
  currency: z.string().default("NGN"),
});

export const updateBusinessSchema = businessOnboardingSchema.partial();