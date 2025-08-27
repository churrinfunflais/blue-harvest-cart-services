/**
 * @file listExpressions.js
 * @description Express middleware for listing all "expression" configurations
 * associated with a specific data entity from the database.
 */
import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { EXPRESSIONS } from '../../../constants/strings.const.js';
import { iError } from '../../../types/error.js';

/**
 * Lists all expression configuration documents for a given data entity. It constructs
 * the path to the 'EXPRESSIONS' sub-collection and fetches all documents within it.
 *
 * @param {Request} req - The Express request object. It expects `db`, `workspace`, and route params.
 * @param {Response} res - The Express response object. The fetched list of expressions is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const listExpressions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.listSchema) throw new iError(MISSING_SCHEMA);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. DB Collection Retrieval ---
        // Construct the full path to the EXPRESSIONS sub-collection for the specified
        // data entity and retrieve all documents within it.
        const dataEntitiesSnapshot = await req.db.collection(req.workspace).doc(req.params.dataEntity).collection(EXPRESSIONS).get();
        // --- 3. Extract and Format Data ---
        // Map over the array of document snapshots and extract the data from each one,
        // creating a clean list of expression objects.
        const expressionsList = dataEntitiesSnapshot?.docs?.map((i) => i.data());

        if (!req.listSchema(expressionsList)) throw new iError(req.listSchema.errors || []);

        // --- 4. Completion ---
        // Attach the final list of expressions to `res.data` for use in subsequent middleware.
        res.data = expressionsList;
        next();
    } catch (error) {
        // Pass any errors to the global error handler for a consistent response.
        next(error);
    }
};

export default listExpressions;
