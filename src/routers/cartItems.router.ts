import { Router } from 'express';

import { ROOT } from '../constants/routes.const.js';
import { getCartItems } from '../middlewares/cart/items/getCartItems.js';
import { response } from '../middlewares/utils/response.mdw.js';
import { validateSchema } from '../middlewares/utils/validateSchema.mdw.js';
import { itemSchema } from '../schemas/item.schema.js';

export const cartItemsRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

cartItemsRouter.get(ROOT, validateSchema(itemSchema), getCartItems, response);
