/**
 * @file evaluateExpression.js
 * @description Express middleware that transforms response data using a JSONata expression.
 * It looks for an `expression` query parameter, finds the corresponding JSONata
 * expression string from a cache, and applies it to the data on `res.data`.
 */
import { NextFunction, Request, Response } from 'express';
import jsonata from 'jsonata';

import {
    EXPRESSION_NOT_FOUND,
    MISSING_DATA_ENTITY,
    MISSING_DATA_TO_TRANSFORM,
    MISSING_DB_OBJECT,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { X_EXPRESSION } from '../../../constants/headers.const.js';
import { Expression } from '../../../schemas/expression.js';
import { iError } from '../../../types/error.js';
import { workspaceCache } from '../../workspace/workspace.mdw.js';

/**
 * Conditionally evaluates a JSONata expression against the `res.data` object.
 * The expression to be used is specified via the `?expression=` query parameter.
 * This middleware can transform a single JSON object or each object within an array.
 *
 * @param {Request} req - The Express request object. It reads the `expression` from `req.query`.
 * @param {Response} res - The Express response object. `res.data` is the target for transformation.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const evaluateExpression = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Conditional Execution ---
        // If no `expression` query parameter is provided, this middleware does nothing
        // and immediately passes control to the next handler.
        if (!req.query.expression) return next();

        // --- 2. Prerequisite Validation ---
        // If an expression is requested, ensure all required data is present.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);
        if (!res.data) throw new iError(MISSING_DATA_TO_TRANSFORM);

        // --- 3. Retrieve and Compile Expression ---
        // Fetch all expression configurations for the given entity from the cache.
        const entityData = workspaceCache.get(`${req.workspace}/${req.params.dataEntity}`) as { expressions: Expression[] };
        // Find the specific expression object that matches the ID from the query parameter.
        const expressionObject = entityData?.expressions?.find((i) => i.id === req.query.expression);
        const expressionString = expressionObject?.expression as string;

        if (!expressionString) throw new iError(EXPRESSION_NOT_FOUND);

        // Compile the raw string into an executable JSONata expression.
        const expression = jsonata(expressionString);
        if (!expression) throw new iError(EXPRESSION_NOT_FOUND);

        // --- 4. Evaluate Expression Against Data ---
        // The evaluation logic differs based on whether `res.data` is an array or a single object.
        // If it's a single object, evaluate it directly.
        if (!Array.isArray(res.data)) res.data = (await expression.evaluate(res.data)) as object;
        // If it's an array of objects, map over the array and evaluate each object concurrently.
        if (Array.isArray(res.data) && res.data?.length) res.data = await Promise.all(res.data.map((i) => expression.evaluate(i)));

        // --- 5. Set Response Header and Completion ---
        // Add a header to the response to indicate which expression was used for the transformation.
        res.set(X_EXPRESSION, req.query.expression);

        // --- 4. Completion ---
        // After successful evaluate the JsonNata expression, pass control to the next middleware.
        next();
    } catch (error) {
        // If any part of the process fails, pass the error to the global
        // error handler for a consistent response.
        next(error);
    }
};

export default evaluateExpression;
