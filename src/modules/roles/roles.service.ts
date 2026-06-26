import { prisma } from "../../database/prisma";
import { createCrudService } from "../../helpers/crud-service";

export const rolesService = createCrudService({
  model: prisma.roles,
  orderBy: { createdAt: "desc" },
});
