import { randomUUID } from 'node:crypto';

import { NextFunction, Request, Response } from 'express';

import { MISSING_BODY, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { CONFIG, ROLES } from '../../../constants/paths.const.js';
import refreshWorkspaceConfigCache from '../../../handlers/workspace/refreshWorkspaceConfigCache.handler.js';
import { iError } from '../../../types/error.js';

const createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const data = req.body as object & { id?: string };

        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        const newRoleRef = req.db
            .collection(req.workspace)
            .doc(CONFIG)
            .collection(ROLES)
            .doc(req.params.roleId || (data.id as string) || randomUUID());

        const newData = { ...data, id: newRoleRef.id };
        await newRoleRef.set(newData);

        res.data = newData;
        res.status(201);

        await refreshWorkspaceConfigCache(req.db, req.workspace);

        next();
    } catch (error) {
        next(error);
    }
};

export default createRole;
