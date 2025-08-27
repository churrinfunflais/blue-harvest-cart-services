import { Router } from 'express';

import { ROOT, USER_ID } from '../constants/paths.const.js';
import createUser from '../middlewares/config/users/createUser.mdw.js';
import getUser from '../middlewares/config/users/getUser.mdw.js';
import listUsers from '../middlewares/config/users/listUsers.mdw.js';
import updateUser from '../middlewares/config/users/modifyUserroles.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { userSchema } from '../schemas/user.js';

export const usersRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

usersRouter.get(ROOT, fixedSchema(userSchema), listUsers, respond);
usersRouter.get(USER_ID, fixedSchema(userSchema), getUser, respond);
usersRouter.post(ROOT, fixedSchema(userSchema), createUser, respond);
usersRouter.patch(USER_ID, fixedSchema(userSchema), updateUser, respond);
