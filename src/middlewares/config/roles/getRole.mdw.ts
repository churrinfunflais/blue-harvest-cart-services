import { NextFunction, Request, Response } from 'express';

import {
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_SCHEMA,
    MISSING_WEBHOOK_ID,
    MISSING_WORKSPACE,
    WEBHOOK_NOT_FOUND,
} from '../../../constants/errors.const.js';
import { WEBHOOKS } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

const getRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);
        if (!req.params.webhookId) throw new iError(MISSING_WEBHOOK_ID);

        const ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(WEBHOOKS).doc(req.params.webhookId).get();
        const snapshot = await ref;

        if (!snapshot.exists) throw new iError(WEBHOOK_NOT_FOUND);

        const webhookData = snapshot.data();

        if (!webhookData) throw new iError(WEBHOOK_NOT_FOUND);

        if (!req.objectSchema(webhookData)) throw new iError(req.objectSchema.errors || []);

        res.data = webhookData;
        next();
    } catch (error) {
        next(error);
    }
};

export default getRole;
