import { Router } from 'express';

import { ROLES, USERS } from '../constants/paths.const.js';
import { rolesRouter } from './roles.router.js';
import { usersRouter } from './users.router.js';

export const configRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

configRouter.use(ROLES, rolesRouter);
configRouter.use(USERS, usersRouter);
