/**
 * @file webhooks.mdw.js
 * @description Express middleware to trigger webhooks asynchronously via Google Cloud Pub/Sub.
 * This middleware identifies the type of operation (Create, Update, Delete), finds
 * matching webhooks from a cache, and publishes a message for each one to a
 * designated Pub/Sub topic for background processing.
 */
import { PubSub } from '@google-cloud/pubsub';
import { AxiosRequestConfig } from 'axios';
import { NextFunction, Request, Response } from 'express';

import { WEBHOOKS_TOPIC } from '../../../config.js';
import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { X_WEBHOOK } from '../../../constants/headers.const.js';
import { CREATE, DELETE, PATCH, POST, UPDATE } from '../../../constants/strings.const.js';
import { Webhook } from '../../../schemas/webhook.js';
import { iError } from '../../../types/error.js';
import { workspaceCache } from '../../workspace/workspace.mdw.js';

/**
 * Finds and publishes messages for all webhooks that match the current request's
 * operation type (e.g., CREATE, UPDATE). This process is asynchronous and
 * offloaded to Google Cloud Pub/Sub, so it does not block the request-response cycle.
 *
 * @param {Request} req - The Express request object. Expected to have `db`, `workspace`, `method`, and `params`.
 * @param {Response} res - The Express response object. `res.data` is used as part of the webhook payload.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const webhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure that essential objects and parameters are attached to the request object.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. Determine the Trigger Type ---
        // Map the HTTP method of the incoming request to a standardized trigger type string
        // (e.g., 'CREATE', 'UPDATE', 'DELETE'). This allows webhooks to be configured
        // to fire only on specific types of operations.
        const triggerType = (req.method === POST && CREATE) || (req.method === PATCH && UPDATE) || (req.method === DELETE && DELETE);

        // --- 3. Retrieve and Filter Webhooks ---
        // Fetch all webhook configurations for the entity and filter them to find only
        // those that match the current operation's triggerType.
        const entityData = workspaceCache.get(`${req.workspace}/${req.params.dataEntity}`) as { webhooks: Webhook[] };
        const webhookList = entityData?.webhooks?.filter((i: Webhook) => i.triggerType === triggerType);

        // If there are no matching webhooks, no configured topic, or the operation
        // type isn't supported, then exit immediately.
        if (!webhookList?.length || !WEBHOOKS_TOPIC || !triggerType) return next();

        // --- 4. Publish Messages to Pub/Sub ---
        // Offload the actual webhook execution to a background worker by publishing
        // a message for each webhook to a central Pub/Sub topic.
        const pubsub = new PubSub();

        // Use Promise.all to fire off all publish requests concurrently.
        // This is non-blocking for the end user; we don't wait for the background
        // workers to process these messages.
        await Promise.all(
            webhookList.map(async (webhook) =>
                pubsub.topic(WEBHOOKS_TOPIC).publishMessage({
                    // Attributes are metadata for the message, useful for filtering
                    // subscriptions or for routing logic in the subscriber.
                    attributes: {
                        ...(req.params.objectId && { objectId: req.params.objectId }),
                        entity: req.params.dataEntity as string,
                        triggerType,
                        webhookId: webhook.id as string,
                        webhookName: webhook.name as string,
                        workspace: req.workspace as string,
                    },
                    // The main payload of the message. This will be consumed by a subscriber.
                    json: {
                        // Webhooks are always sent as POST requests.
                        data: JSON.stringify({
                            ...(req.params.objectId && { objectId: req.params.objectId }),
                            data: res.data as object,
                            entity: req.params.dataEntity,
                            triggerType,
                            webhookId: webhook.id as string,
                            webhookName: webhook.name as string,
                            workspace: req.workspace,
                        }),
                        method: POST,
                        url: webhook.url as string,
                    } as AxiosRequestConfig,
                })
            )
        );

        const webhookIds = webhookList.map((webhook) => webhook.id as string)?.join();
        webhookIds && res.set(X_WEBHOOK, webhookIds);

        // --- 5. Completion ---
        // After successfully publishing the messages, pass control to the next middleware.
        next();
    } catch (error) {
        // If any part of the process fails, pass the error to the Express
        // global error handler.
        next(error);
    }
};

export default webhooks;
