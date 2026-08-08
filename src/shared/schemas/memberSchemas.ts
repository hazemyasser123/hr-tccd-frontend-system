import { z } from "zod";

// Egyptian phone number regex: supports formats like 01xxxxxxxxx, +201xxxxxxxxx, 201xxxxxxxxx
const egyptianPhoneRegex = /^(\+?20|0)?1[0125]\d{8}$/;

export const memberSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(egyptianPhoneRegex, "Please enter a valid Egyptian phone number (e.g., 01xxxxxxxxx)"),
  gradYear: z
    .coerce
    .number()
    .min(1900, "Graduation year must be after 1900")
    .max(new Date().getFullYear() + 10, "Graduation year cannot be in the far future"),
  committee: z
    .string()
    .min(1, "Committee is required"),
  position: z
    .string()
    .optional(),
  nationalId: z
    .string()
    .min(1, "National ID is required")
    .length(14, "National ID must be exactly 14 digits")
    .regex(/^\d{14}$/, "National ID must contain only numbers"),
  engineeringMajor: z
    .string()
    .min(1, "Engineering major is required"),
  educationSystem: z
    .string()
    .min(1, "Education system is required"),
});

export type MemberFormData = z.infer<typeof memberSchema>;
