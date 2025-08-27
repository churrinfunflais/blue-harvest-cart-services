import { Router } from 'express';

import { AUTH, DATA_ENTITIES, SEARCH } from '../constants/paths.const.js';
import { authRouter } from './auth.router.js';
import { dataEntitiesRouter } from './dataEntities.router.js';
import { searchRouter } from './search.router.js';

export const publicRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

publicRouter.use(SEARCH, searchRouter);
publicRouter.use(AUTH, authRouter);
publicRouter.use(DATA_ENTITIES, dataEntitiesRouter);
