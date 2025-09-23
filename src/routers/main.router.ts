import { Router } from 'express';

import { CART } from '../constants/routes.const.js';
import { cartRouter } from './cart.router.js';

export const mainRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

mainRouter.use(CART, cartRouter);
