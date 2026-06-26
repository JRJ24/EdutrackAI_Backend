import { z } from "zod";

export const activeToggleSchema = z.object({
  isActive: z.boolean(),
  reason: z.string().trim().min(1).optional(),
});

export type ActiveToggleInput = z.infer<typeof activeToggleSchema>;