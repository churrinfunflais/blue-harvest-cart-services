import { NextFunction, Request, Response } from 'express';

import { listIdpUsers } from '../../../clients/idp.client.js';
import { MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { iError } from '../../../types/error.js';

const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.listSchema) throw new iError(MISSING_SCHEMA);

        const offset = Number(req.query.offset) || 0;
        const limit = Number(req.query.limit) || 10;

        const userList = await listIdpUsers(req.workspace, offset, limit);

        if (!req.listSchema(userList)) throw new iError(req.listSchema.errors || []);

        res.data = userList;
        next();
    } catch (error) {
        next(error);
    }
};

export default listUsers;
