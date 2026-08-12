import { z } from "zod";

export const applyCatalogSchema = z.object({
  institutionKey: z.string().min(1),
  programKey: z.string().min(1),
  currentPeriod: z.number().int().min(1).max(20),
  selectedSubjectKeys: z.array(z.string().min(1)).min(1),
});

export const customContextSchema = z.object({
  institutionName: z.string().trim().min(2).max(160),
  programName: z.string().trim().min(2).max(160),
  currentPeriod: z.number().int().min(1).max(20),
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

export const managedInstitutionSchema = z.object({
  name: z.string().trim().min(2).max(160),
  shortName: z.string().trim().min(2).max(40),
  country: z.string().trim().min(2).max(100).default("República Dominicana"),
  websiteUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const managedProgramSchema = z.object({
  name: z.string().trim().min(2).max(160),
  degreeType: z.string().trim().min(2).max(100).default("Programa académico"),
  periods: z.number().int().min(1).max(20),
  totalCredits: z.number().int().min(0).max(400).default(0),
  sourceUrl: z.string().trim().url().optional().or(z.literal("")),
});

export const managedCatalogSubjectSchema = z.object({
  code: z.string().trim().max(40).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(160),
  credits: z.number().int().min(0).max(30).default(0),
  period: z.number().int().min(1).max(20),
});

export type ApplyCatalogInput = z.infer<typeof applyCatalogSchema>;
export type CustomContextInput = z.infer<typeof customContextSchema>;
export type CustomSubjectInput = z.infer<typeof customSubjectSchema>;
export type UpdateMySubjectInput = z.infer<typeof updateMySubjectSchema>;
export type ManagedInstitutionInput = z.infer<typeof managedInstitutionSchema>;
export type ManagedProgramInput = z.infer<typeof managedProgramSchema>;
export type ManagedCatalogSubjectInput = z.infer<typeof managedCatalogSubjectSchema>;
