import { Router } from 'express';

import { DATA_ENTITIES, ROOT } from '../constants/paths.const.js';
import { configRouter } from './config.router.js';
import { dataEntitiesRouter } from './dataEntities.router.js';
import { dataEntitiesUtilsRouter } from './dataEntitiesUtils.router.js';

export const privateRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

privateRouter.use(ROOT, configRouter);
privateRouter.use(DATA_ENTITIES, dataEntitiesUtilsRouter);
privateRouter.use(DATA_ENTITIES, dataEntitiesRouter);
