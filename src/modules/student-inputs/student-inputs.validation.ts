import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

const itemTypeSchema = z.enum(["deadline", "material", "note"]);

export const createStudentInputSchema = z.object({
  subjectId: z.string().uuid(),
  itemType: itemTypeSchema,
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1000).optional(),
  topic: z.string().trim().max(160).optional(),
  url: z.string().url().max(1000).optional(),
  scheduledAt: z.coerce.date().optional(),
}).superRefine((value, ctx) => {
  if (value.itemType === "deadline" && !value.scheduledAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduledAt"],
      message: "A deadline requires a date and time",
    });
  }

  if (value.itemType === "material" && !value.url && !value.description) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["url"],
      message: "A material requires a URL or description",
    });
  }
});

export const updateStudentInputSchema = nonEmptyObject(
  z.object({
    title: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    topic: z.string().trim().max(160).nullable().optional(),
    url: z.string().url().max(1000).nullable().optional(),
    scheduledAt: z.coerce.date().nullable().optional(),
  }),
);

export type CreateStudentInput = z.infer<typeof createStudentInputSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentInputSchema>;
