/**
 * @file createExpression.js
 * @description Express middleware for creating or updating a single JSONata "expression"
 * configuration in DB. Expressions are used for data transformation and
 * are associated with a specific data entity. This middleware also handles
 * refreshing the relevant cache after a successful write.
 */
import { randomUUID } from 'node:crypto';

import { NextFunction, Request, Response } from 'express';
import jsonata from 'jsonata';

import {
    EXPRESSION_IS_NOT_VALID,
    MISSING_BODY,
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_EXPRESSION,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { EXPRESSIONS, STRING } from '../../../constants/strings.const.js';
import refreshDataEntityCache from '../../../handlers/workspace/refreshDataEntityCache.handler.js';
import { Expression } from '../../../schemas/expression.js';
import { iError } from '../../../types/error.js';

/**
 * Creates or overwrites an expression configuration for a data entity. It validates
 * the incoming data, including a check to ensure the expression string is a valid
 * JSONata expression. It then writes the configuration to DB and triggers a
 * cache refresh to make the change available immediately.
 *
 * @param {Request} req - The Express request object. Expects `db`, `body`, `schema`, `workspace`, and `dataEntity` param.
 * @param {Response} res - The Express response object. The created expression data is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const createExpression = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. Schema and Expression-Specific Validation ---
        const data = req.body as Expression;

        // Validate the overall structure of the incoming data against the schema.
        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        // Perform additional, mandatory checks for expression-specific fields.
        if (!data.expression) throw new iError(MISSING_EXPRESSION);
        if (typeof data.expression !== STRING) throw new iError(EXPRESSION_IS_NOT_VALID);

        // --- 3. JSONata Expression Compilation Check ---
        // Before saving, attempt to compile the expression string to ensure it is
        // syntactically valid JSONata. This prevents invalid expressions from being stored.
        try {
            jsonata(data.expression as string);
        } catch {
            throw new iError(EXPRESSION_IS_NOT_VALID);
        }

        // --- 4. Firestore Write Operation ---
        // Create or overwrite the expression document in Firestore using its unique ID.

        const newExpressionRef = req.db
            .collection(req.workspace)
            .doc(req.params.dataEntity)
            .collection(EXPRESSIONS)
            .doc(req.params.expressionId || (data.id as string) || randomUUID());

        await newExpressionRef.set({ ...data, id: newExpressionRef.id });

        // Attach the created/updated expression data to `res.data`.
        res.data = data;
        res.status(201);

        // --- 5. Cache Refresh ---
        // After a successful write, trigger a cache refresh for this data entity
        // to ensure the new expression is immediately available for use.
        await refreshDataEntityCache(req.db, req.workspace, req.params.dataEntity, true);

        // --- 6. Completion ---
        next();
    } catch (error) {
        // Pass any errors to the global error handler.
        next(error);
    }
};

export default createExpression;
