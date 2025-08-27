import { Router } from 'express';

import { ROLE_ID, ROOT } from '../constants/paths.const.js';
import createRole from '../middlewares/config/roles/createRole.mdw.js';
import getRole from '../middlewares/config/roles/getRole.mdw.js';
import listRoles from '../middlewares/config/roles/listRoles.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { roleSchema } from '../schemas/role.js';

export const rolesRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

rolesRouter.post(ROOT, fixedSchema(roleSchema), createRole, respond);
rolesRouter.patch(ROLE_ID, fixedSchema(roleSchema), createRole, respond);
rolesRouter.get(ROOT, fixedSchema(roleSchema), listRoles, respond);
rolesRouter.get(ROLE_ID, fixedSchema(roleSchema), getRole, respond);
