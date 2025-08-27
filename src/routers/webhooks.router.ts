import { Router } from 'express';

import { ROOT, WEBHOOK_ID } from '../constants/paths.const.js';
import createWebhook from '../middlewares/dataEntities/webhooks/createWebhook.mdw.js';
import getWebhook from '../middlewares/dataEntities/webhooks/getWebhook.mdw.js';
import listWebhooks from '../middlewares/dataEntities/webhooks/listWebhooks.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { webhookSchema } from '../schemas/webhook.js';

export const webhooksRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

webhooksRouter.post(ROOT, fixedSchema(webhookSchema), createWebhook, respond);
webhooksRouter.patch(WEBHOOK_ID, fixedSchema(webhookSchema), createWebhook, respond);
webhooksRouter.get(ROOT, fixedSchema(webhookSchema), listWebhooks, respond);
webhooksRouter.get(WEBHOOK_ID, fixedSchema(webhookSchema), getWebhook, respond);
