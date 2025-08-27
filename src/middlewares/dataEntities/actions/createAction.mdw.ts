/**
 * @file createAction.js
 * @description Express middleware for creating or updating a single "action"
 * configuration in the db. Actions are webhook-like triggers associated with a
 * data entity. This middleware also handles refreshing the relevant cache.
 */
import { randomUUID } from 'node:crypto';

import { NextFunction, Request, Response } from 'express';

import {
    MISSING_ACTION,
    MISSING_BODY,
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { ACTIONS } from '../../../constants/strings.const.js';
import refreshDataEntityCache from '../../../handlers/workspace/refreshDataEntityCache.handler.js';
import { Action } from '../../../schemas/action.js';
import { iError } from '../../../types/error.js';

/**
 * Creates or overwrites an action configuration for a data entity. It validates
 * the incoming action data, writes it to a specific sub-collection in the db,
 * and then triggers a cache refresh to ensure the new action is immediately available.
 *
 * @param {Request} req - The Express request object. It expects `db`, `body`, `schema`, `workspace`, and `dataEntity` param.
 * @param {Response} res - The Express response object. The created action data is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const createAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. Schema and Action-Specific Validation ---
        const data = req.body as Action;

        // Validate the overall structure of the incoming data against the schema.
        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        // Perform additional, mandatory checks for action-specific fields.
        if (!data.url) throw new iError(MISSING_ACTION);

        // --- 3. DB Write Operation ---
        // Create or overwrite the action document in DB.
        // The path is specific to the workspace, data entity, and the action's own ID.
        // Using .set() ensures that if a document with this ID already exists, it will be replaced.
        const newActionRef = req.db
            .collection(req.workspace)
            .doc(req.params.dataEntity)
            .collection(ACTIONS)
            .doc(req.params.actionId || (data.id as string) || randomUUID());

        await newActionRef.set({ ...data, id: newActionRef.id });

        // Attach the created/updated action data to `res.data` for subsequent middleware.
        res.data = data;
        res.status(201);

        // --- 4. Cache Refresh ---
        // CRITICAL: After successfully modifying the configuration in the database,
        // trigger a cache refresh for this data entity. This ensures that subsequent
        // requests will use the updated action configuration.
        await refreshDataEntityCache(req.db, req.workspace, req.params.dataEntity, true);

        // --- 5. Completion ---
        // After successfully creating the document, pass control to the next middleware.
        next();
    } catch (error) {
        // Pass any errors to the global error handler.
        next(error);
    }
};

export default createAction;
