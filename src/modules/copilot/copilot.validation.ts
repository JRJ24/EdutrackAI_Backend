import { z } from "zod";

export const copilotAskSchema = z.object({
  message: z.string().trim().min(2).max(500),
});

export type CopilotAskInput = z.infer<typeof copilotAskSchema>;
