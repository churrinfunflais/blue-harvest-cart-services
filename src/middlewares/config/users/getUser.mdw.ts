import { NextFunction, Request, Response } from 'express';

import { getIdpUser } from '../../../clients/idp.client.js';
import { MISSING_DB_OBJECT, MISSING_OBJECT_ID, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { iError } from '../../../types/error.js';

const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.userId) throw new iError(MISSING_OBJECT_ID);

        const user = await getIdpUser(req.params.userId, req.workspace);

        if (!user) throw new iError('User not found', 404);

        if (!req.objectSchema(user)) throw new iError(req.objectSchema.errors || []);

        res.data = user;
        next();
    } catch (error) {
        next(error);
    }
};

export default getUser;
