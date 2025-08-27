import { Router } from 'express';

import { DATA_ENTITY_ACTIONS, DATA_ENTITY_EXPRESSIONS, DATA_ENTITY_WEBHOOKS, DOCS, SCHEMAS } from '../constants/paths.const.js';
import { actionsRouter } from './actions.router.js';
import { dataEntitiesDocsRouter } from './dataEntitiesDocs.router.js';
import { expressionsRouter } from './expressions.router.js';
import { schemasRouter } from './schemas.router.js';
import { webhooksRouter } from './webhooks.router.js';

export const dataEntitiesUtilsRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

dataEntitiesUtilsRouter.use(DOCS, dataEntitiesDocsRouter);
dataEntitiesUtilsRouter.use(SCHEMAS, schemasRouter);
dataEntitiesUtilsRouter.use(DATA_ENTITY_EXPRESSIONS, expressionsRouter);
dataEntitiesUtilsRouter.use(DATA_ENTITY_WEBHOOKS, webhooksRouter);
dataEntitiesUtilsRouter.use(DATA_ENTITY_ACTIONS, actionsRouter);
