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
  institutionKey: z.string().trim().min(1).optional(),
  programKey: z.string().trim().min(1).optional(),
  institutionName: z.string().trim().min(1).optional(),
}).superRefine((value, ctx) => {
  const hasInstitution = Boolean(value.institutionKey);
  const hasProgram = Boolean(value.programKey);

  if (hasInstitution !== hasProgram) {
    ctx.addIssue({
      code: "custom",
      path: [hasInstitution ? "programKey" : "institutionKey"],
      message: "Institution and program must be selected together",
    });
  }
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
