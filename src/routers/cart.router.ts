import { Router } from 'express';

import { getCart } from '../middlewares/cart/getCart.mdw.js';
import { response } from '../middlewares/utils/response.mdw.js';
import { validateSchema } from '../middlewares/utils/validateSchema.mdw.js';
import { cartSchema } from '../schemas/cart.schema.js';

export const cartRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

cartRouter.get('/cart/:cartId', validateSchema(cartSchema), getCart, response);
// cartRouter.get('/cart/:cartId/client');
// cartRouter.get('/cart/:cartId/items');
// cartRouter.get('/cart/:cartId/shipping');
// cartRouter.get('/cart/:cartId/payment');
