import { createCrudController } from "../../helpers/crud-controller";
import { rolesService } from "./roles.service";

export const rolesController = createCrudController("Role", rolesService);
