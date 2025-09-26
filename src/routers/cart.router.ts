import { Router } from 'express';

import { CART_ID, CART_ID_CLIENT, CART_ID_DELIVERY, CART_ID_ITEMS, CART_ID_PAYMENTS } from '../constants/routes.const.js';
import { getCart } from '../middlewares/cart/getCart.mdw.js';
import { response } from '../middlewares/utils/response.mdw.js';
import { cartClientRouter } from './cartClient.router.js';
import { cartItemsRouter } from './cartItems.router.js';
import { cartPaymentsRouter } from './cartPayment.router.js';

export const cartRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

cartRouter.use(CART_ID_CLIENT, cartClientRouter);
cartRouter.use(CART_ID_ITEMS, cartItemsRouter);
cartRouter.use(CART_ID_PAYMENTS, cartPaymentsRouter);
cartRouter.use(CART_ID_DELIVERY, cartPaymentsRouter);

cartRouter.get(CART_ID, /*validateSchema(cartSchema),*/ getCart, response);
