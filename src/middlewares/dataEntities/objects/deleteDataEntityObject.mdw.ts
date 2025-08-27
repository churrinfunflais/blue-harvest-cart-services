/**
 * @file deleteDataEntityObject.js
 * @description Express middleware for deleting a document.
 * It determines the correct document path, including nested
 * sub-collections, and delegates the deletion operation to a controller.
 */
import { NextFunction, Request, Response } from 'express';

import { MISSING_DB_OBJECT, MISSING_OBJECT_ID, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { OBJECTS } from '../../../constants/strings.const.js';
import deleteController from '../../../controllers/dataEntities/delete.controller.js';
import { iError } from '../../../types/error.js';

/**
 * Deletes a data entity object from. This middleware is responsible
 * for validating the request, constructing the precise document reference
 * (including for nested documents), and then passing that reference to a
 * dedicated controller to perform the deletion.
 *
 * @param {Request} req - The Express request object. Expected to have `db`, `schema`, `workspace`, and route params.
 * @param {Response} _res - The Express response object (unused in this function, denoted by `_`).
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const deleteDataEntityObject = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_SCHEMA);
        if (!req.params.objectId) throw new iError(MISSING_OBJECT_ID);

        // --- 2. Determine Document Reference ---
        // Start by building the base path to the specific document to be deleted.
        let ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(OBJECTS).doc(req.params.objectId);

        // Check for parameters that indicate a nested or sub-collection document.
        // If they exist, refine the reference to point to the specific sub-document.
        // e.g., /users/{userId}/posts/{postId}
        if (req.params.objectId && req.params.subDataEntity && req.params.subObjectId)
            ref = ref.collection(req.params.subDataEntity).doc(req.params.subObjectId);

        // --- 3. Delegate Deletion to Controller ---
        // Pass the final, precise document reference to the delete controller
        // to handle the actual database operation.
        await deleteController(ref);

        // --- 4. Completion ---
        // After successful deletion, pass control to the next middleware.
        next();
    } catch (error) {
        // If any part of the process fails, pass the error to the global
        // error handler for a consistent response.
        next(error);
    }
};

export default deleteDataEntityObject;
