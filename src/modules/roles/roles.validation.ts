import { z } from "zod";
import { nonEmptyObject } from "../../helpers/validations";

const roleSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const createRoleSchema = roleSchema;
export const updateRoleSchema = nonEmptyObject(roleSchema);
