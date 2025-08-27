import { NextFunction, Request, Response } from 'express';

import { createIdpUser } from '../../../clients/idp.client.js';
import { MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { User } from '../../../schemas/user.js';
import { iError } from '../../../types/error.js';

const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);

        const data = req.body as User;
        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        const newUser = await createIdpUser(data, req.workspace);

        if (!newUser) throw new iError('Error creating user', 500);
        if (!req.objectSchema(newUser)) throw new iError(req.objectSchema.errors || []);

        res.data = newUser;
        next();
    } catch (error) {
        next(error);
    }
};

export default createUser;
