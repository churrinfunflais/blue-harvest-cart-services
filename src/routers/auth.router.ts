import { Router } from 'express';

import { AUTH_ENCRIPT_TOKEN, AUTH_TOKEN } from '../constants/paths.const.js';
import authToken from '../middlewares/auth/authToken.pub.mdw.js';
import { encriptToken } from '../middlewares/auth/encriptToken.pub.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';

export const authRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

authRouter.post(AUTH_TOKEN, authToken, respond);
authRouter.post(AUTH_ENCRIPT_TOKEN, encriptToken, respond);
