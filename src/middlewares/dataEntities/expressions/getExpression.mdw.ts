/**
 * @file getExpression.js
 * @description Express middleware for fetching a single "expression" configuration
 * from the database by its ID. Expressions are used for data transformation and
 * are associated with a specific data entity.
 */
import { NextFunction, Request, Response } from 'express';

import {
    EXPRESSION_NOT_FOUND,
    MISSING_DATA_ENTITY,
    MISSING_DB_OBJECT,
    MISSING_EXPRESSION_ID,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
} from '../../../constants/errors.const.js';
import { EXPRESSIONS } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

/**
 * Fetches a single expression configuration document from the database. It constructs
 * the precise document path based on the workspace, data entity, and expression ID
 * provided in the request parameters.
 *
 * @param {Request} req - The Express request object. It expects `db`, `workspace`, and route params.
 * @param {Response} res - The Express response object. The fetched expression data is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const getExpression = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);
        if (!req.params.expressionId) throw new iError(MISSING_EXPRESSION_ID);

        // --- 2. DB Document Retrieval ---
        // Construct the full path to the specific expression document in the database
        // and initiate the get() operation.
        const ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(EXPRESSIONS).doc(req.params.expressionId).get();
        const snapshot = await ref;
        // --- 3. Validate Snapshot and Data ---
        // Check if the document snapshot exists. If not, the expression was not found.
        if (!snapshot.exists) throw new iError(EXPRESSION_NOT_FOUND);

        const schemaData = snapshot.data();
        // Also, check if the document, though it exists, contains any data.
        if (!schemaData) throw new iError(EXPRESSION_NOT_FOUND);

        if (!req.objectSchema(schemaData)) throw new iError(req.objectSchema.errors || []);

        // --- 4. Completion ---
        // Attach the fetched expression data to `res.data` for use in subsequent middleware.
        res.data = schemaData;
        next();
    } catch (error) {
        // Pass any errors (e.g., validation failure, document not found)
        // to the global error handler for a consistent response.
        next(error);
    }
};

export default getExpression;
