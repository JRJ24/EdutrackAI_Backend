import { z } from "zod";

export const applyCatalogSchema = z.object({
  institutionKey: z.string().min(1),
  programKey: z.string().min(1),
  currentPeriod: z.number().int().min(1).max(20),
  selectedSubjectKeys: z.array(z.string().min(1)).min(1),
});

export const customSubjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  difficultyLevel: z.enum(["low", "medium", "high"]).default("medium"),
});

export const updateMySubjectSchema = z.object({
  difficultyLevel: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ApplyCatalogInput = z.infer<typeof applyCatalogSchema>;
export type CustomSubjectInput = z.infer<typeof customSubjectSchema>;
export type UpdateMySubjectInput = z.infer<typeof updateMySubjectSchema>;
