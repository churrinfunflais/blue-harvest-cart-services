import { randomUUID } from 'node:crypto';

import { NextFunction, Request, Response } from 'express';

import {
    MISSING_BODY,
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_SCHEMA,
    MISSING_WEBHOOK,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { WEBHOOKS } from '../../../constants/strings.const.js';
import refreshDataEntityCache from '../../../handlers/workspace/refreshDataEntityCache.handler.js';
import { Webhook } from '../../../schemas/webhook.js';
import { iError } from '../../../types/error.js';

const createWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        const data = req.body as Webhook;

        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        if (!data.url) throw new iError(MISSING_WEBHOOK);

        const newWebhookRef = req.db
            .collection(req.workspace)
            .doc(req.params.dataEntity)
            .collection(WEBHOOKS)
            .doc(req.params.webhookId || (data.id as string) || randomUUID());

        await newWebhookRef.set({ ...data, id: newWebhookRef.id });

        res.data = data;
        res.status(201);

        await refreshDataEntityCache(req.db, req.workspace, req.params.dataEntity, true);

        next();
    } catch (error) {
        next(error);
    }
};

export default createWebhook;
