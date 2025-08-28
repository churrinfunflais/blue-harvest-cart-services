import { Router } from 'express';

import { cartRouter } from './cart.router.js';

export const mainRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

mainRouter.use(cartRouter);
