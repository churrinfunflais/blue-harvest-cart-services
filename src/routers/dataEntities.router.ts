import { Router } from 'express';

import { DATA_ENTITY, DATA_ENTITY_OBJECT_ID, SUB_DATA_ENTITY, SUB_DATA_ENTITY_OBJECT_ID } from '../constants/paths.const.js';
import publicRouteAuth from '../middlewares/auth/publicRouteAuth.pub.mdw.js';
import actions from '../middlewares/dataEntities/actions/acctions.mdw.js';
import evaluateExpression from '../middlewares/dataEntities/expressions/evaluateExpression.mdw.js';
import createDataEntityObject from '../middlewares/dataEntities/objects/createDataEntityObject.mdw.js';
import deleteDataEntityObject from '../middlewares/dataEntities/objects/deleteDataEntityObject.mdw.js';
import getDataEntityObject from '../middlewares/dataEntities/objects/getDataEntityObject.mdw.js';
import listDataEntityObjects from '../middlewares/dataEntities/objects/listDataEntityObjects.mdw.js';
import updateDataEntityObject from '../middlewares/dataEntities/objects/updateDataEntityObject.mdw.js';
import webhooks from '../middlewares/dataEntities/webhooks/webhooks.mdw.js';
import { dataEntitySchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';

export const dataEntitiesRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

dataEntitiesRouter.use([DATA_ENTITY, SUB_DATA_ENTITY, DATA_ENTITY_OBJECT_ID, SUB_DATA_ENTITY_OBJECT_ID], dataEntitySchema, publicRouteAuth);

dataEntitiesRouter.get([DATA_ENTITY, SUB_DATA_ENTITY], listDataEntityObjects, evaluateExpression, respond);
dataEntitiesRouter.post([DATA_ENTITY, SUB_DATA_ENTITY], createDataEntityObject, webhooks, actions, respond);
dataEntitiesRouter.get([DATA_ENTITY_OBJECT_ID, SUB_DATA_ENTITY_OBJECT_ID], getDataEntityObject, evaluateExpression, respond);
dataEntitiesRouter.patch([DATA_ENTITY_OBJECT_ID, SUB_DATA_ENTITY_OBJECT_ID], updateDataEntityObject, webhooks, actions, respond);
dataEntitiesRouter.delete([DATA_ENTITY_OBJECT_ID, SUB_DATA_ENTITY_OBJECT_ID], deleteDataEntityObject, webhooks, respond);
