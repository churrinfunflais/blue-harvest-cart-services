/**
 * @file getAction.js
 * @description Express middleware for fetching a single "action" configuration
 * from Firestore by its ID. Actions are webhook-like triggers associated
 * with a data entity.
 */
import { NextFunction, Request, Response } from 'express';

import {
    ACTION_NOT_FOUND,
    MISSING_ACTION_ID,
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { ACTIONS } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

/**
 * Fetches a single action configuration document from DB. It constructs
 * the precise document path based on the workspace, data entity, and action ID
 * provided in the request parameters.
 *
 * @param {Request} req - The Express request object. It expects `db`, `workspace`, and route params.
 * @param {Response} res - The Express response object. The fetched action data is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const getAction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);
        if (!req.params.actionId) throw new iError(MISSING_ACTION_ID);

        // --- 2. DB Document Retrieval ---
        // Construct the full path to the specific action document in DB and
        // initiate the get() operation.
        const ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(ACTIONS).doc(req.params.actionId).get();
        const snapshot = await ref;

        // --- 3. Validate Snapshot and Data ---
        // Check if the document snapshot exists. If not, the action was not found.
        if (!snapshot.exists) throw new iError(ACTION_NOT_FOUND);

        const actionData = snapshot.data();

        // Also, check if the document, though it exists, contains any data.
        if (!actionData) throw new iError(ACTION_NOT_FOUND);

        if (!req.objectSchema(actionData)) throw new iError(req.objectSchema.errors || []);

        // --- 4. Completion ---
        // Attach the fetched action data to `res.data` for use in subsequent middleware.
        res.data = actionData;
        next();
    } catch (error) {
        // Pass any errors (e.g., validation failure, document not found)
        // to the global error handler for a consistent response.
        next(error);
    }
};

export default getAction;
