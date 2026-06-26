import { z } from "zod";

const passwordSchema = z.string().min(8, "Password must contain at least 8 characters");

export const registerSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  studentCode: z.string().trim().min(1),
  career: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: passwordSchema,
  avatarUrl: z.string().trim().url().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
