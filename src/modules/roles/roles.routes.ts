import { createCrudRoutes } from "../../helpers/crud-routes";
import { rolesController } from "./roles.controller";
import { createRoleSchema, updateRoleSchema } from "./roles.validation";

export default createCrudRoutes(rolesController, createRoleSchema, updateRoleSchema);
