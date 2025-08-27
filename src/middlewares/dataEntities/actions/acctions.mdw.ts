/**
 * @file actions.mdw.js
 * @description Express middleware for executing a sequential chain of webhook-like "actions".
 * This middleware orchestrates a data transformation pipeline where the output of one
 * HTTP POST request becomes the input for the next, based on a configuration
 * retrieved from a cache.
 */

import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { X_DATA_ENTITY, X_OBJECT_ID, X_SCHEMA, X_WORKSPACE } from '../../../constants/headers.const.js';
import { Action } from '../../../schemas/action.js';
import { iError } from '../../../types/error.js';
import { workspaceCache } from '../../workspace/workspace.mdw.js';

/**
 * Executes a sequential chain of actions retrieved for a given data entity.
 * This function acts as a "waterfall" pipeline, where the response from one
 * action is used as the request body for the subsequent action.
 *
 * @param {Request} req - The Express request object. Expected to have `db`, `workspace`, and params like `dataEntity`.
 * @param {Response} res - The Express response object. The `res.data` property is used to pass data between actions.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const actions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure that essential objects and parameters are attached to the request
        // object from previous middleware.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. Action Retrieval ---
        // Construct a cache key and fetch the action configuration for the specific
        // workspace and data entity.
        const entityData = workspaceCache.get(`${req.workspace}/${req.params.dataEntity}`) as { actions: Action[] };
        const actionsList = entityData?.actions;

        // If no actions are defined for this entity, there's nothing to do.
        // Proceed immediately to the next middleware.
        if (!actionsList?.length) return next();

        // --- 3. Sequential Action Chaining ---
        // Use a for...of loop to ensure each action is awaited and completes
        // before the next one in the sequence begins.
        for (const action of actionsList) {
            // Make the outbound POST request. The body of this request is the
            // current state of `res.data`, which is the result of the previous action.
            const response = await axios.post(action.url as string, res.data, {
                headers: {
                    // Forward key contextual information from the original request as headers.
                    [X_DATA_ENTITY]: req.params.dataEntity,
                    [X_OBJECT_ID]: req.params.objectId,
                    [X_SCHEMA]: req.params.schemaId,
                    [X_WORKSPACE]: req.workspace,
                },
                // Apply a specific timeout for this individual action.
                timeout: action.timeout as number,
            });
            // CRITICAL: Overwrite res.data with the response from the current action.
            // This transformed data will be used as the payload for the next action in the loop.
            res.data = response.data as object;
        }

        // --- 4. Completion ---
        // After all actions in the chain have executed successfully, pass control
        // to the next middleware in the Express stack.
        next();
    } catch (error) {
        // If any part of the process fails, pass the error to the Express
        // global error handler for a consistent response.
        next(error);
    }
};

export default actions;
