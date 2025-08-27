import { Router } from 'express';

import { PUB } from '../constants/paths.const.js';
import { privateRouter } from './private.router.js';
import { publicRouter } from './public.router.js';

export const mainRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

mainRouter.use(PUB, publicRouter);
mainRouter.use(privateRouter);
