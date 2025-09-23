import { Router } from 'express';

import { ROOT } from '../constants/routes.const.js';
import { getCartClient } from '../middlewares/cart/client/getCartClient.js';
import { response } from '../middlewares/utils/response.mdw.js';
import { validateSchema } from '../middlewares/utils/validateSchema.mdw.js';
import { clientSchema } from '../schemas/client.schema.js';

export const cartClientRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

cartClientRouter.get(ROOT, validateSchema(clientSchema), getCartClient, response);
