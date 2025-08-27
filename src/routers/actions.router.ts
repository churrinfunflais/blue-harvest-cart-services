import { Router } from 'express';

import { ACTION_ID, ROOT } from '../constants/paths.const.js';
import createAction from '../middlewares/dataEntities/actions/createAction.mdw.js';
import getAction from '../middlewares/dataEntities/actions/getAction.mdw.js';
import listActions from '../middlewares/dataEntities/actions/listActions.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { actionSchema } from '../schemas/action.js';

export const actionsRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

actionsRouter.post(ROOT, fixedSchema(actionSchema), createAction, respond);
actionsRouter.patch(ACTION_ID, fixedSchema(actionSchema), createAction, respond);
actionsRouter.get(ROOT, fixedSchema(actionSchema), listActions, respond);
actionsRouter.get(ACTION_ID, fixedSchema(actionSchema), getAction, respond);
