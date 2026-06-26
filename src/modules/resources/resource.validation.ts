import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

export const createResourceSchema = z.object({
  subjectId: z.string().uuid(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  resourceType: z.string().trim().min(1),
  url: z.string().trim().url(),
  difficulty: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  createdBy: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const updateResourceSchema = nonEmptyObject(
  createResourceSchema.partial().omit({ subjectId: true, createdBy: true }),
);

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;