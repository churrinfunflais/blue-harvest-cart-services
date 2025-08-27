import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { WEBHOOKS } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

const listWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.listSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        const dataEntitiesSnapshot = await req.db.collection(req.workspace).doc(req.params.dataEntity).collection(WEBHOOKS).get();
        const webhooksList = dataEntitiesSnapshot?.docs?.map((i) => i.data());

        if (!req.listSchema(webhooksList)) throw new iError(req.listSchema.errors || []);

        res.data = webhooksList;
        next();
    } catch (error) {
        next(error);
    }
};

export default listWebhooks;
