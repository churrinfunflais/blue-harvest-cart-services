import { NextFunction, Request, Response } from 'express';

import { MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { CONFIG, ROLES } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

const listRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.listSchema) throw new iError(MISSING_SCHEMA);

        const dataEntitiesSnapshot = await req.db.collection(req.workspace).doc(CONFIG).collection(ROLES).get();
        const rolesList = dataEntitiesSnapshot?.docs?.map((i) => i.data());

        if (!req.listSchema(rolesList)) throw new iError(req.listSchema.errors || []);

        res.data = rolesList;
        next();
    } catch (error) {
        next(error);
    }
};

export default listRoles;
