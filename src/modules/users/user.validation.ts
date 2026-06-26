import { z } from "zod";
import {
  nonEmptyObject,
  nullableStringSchema,
  optionalStringSchema,
} from "../../helpers/validations";

const passwordSchema = z.string().min(8, "Password must contain at least 8 characters");

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  studentCode: z.string().trim().min(1),
  career: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: passwordSchema,
  avatarUrl: nullableStringSchema,
  roleId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
});

export const updateUserSchema = nonEmptyObject(
  z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
    studentCode: z.string().trim().min(1).optional(),
    career: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    password: passwordSchema.optional(),
    avatarUrl: nullableStringSchema,
    roleId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
    emailVerified: z.boolean().optional(),
  }),
);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export { optionalStringSchema };