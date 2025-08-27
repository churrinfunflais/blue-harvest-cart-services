/**
 * @file getDataEntityObject.js
 * @description Express middleware for fetching a single Firestore document.
 * It validates the request, constructs the precise document path (including
 * for nested sub-collections), retrieves the document using a controller,
 * validates the fetched data against a schema, and attaches it to the response object.
 */
import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_ID, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { X_CACHED } from '../../../constants/headers.const.js';
import { OBJECTS, TRUE } from '../../../constants/strings.const.js';
import getController from '../../../controllers/dataEntities/get.controller.js';
import { iError } from '../../../types/error.js';

/**
 * Fetches a single data entity object from DB by its ID. This middleware
 * handles the logic for building the correct document reference, delegating the
 * database call to a controller, and performing post-retrieval validation.
 *
 * @param {Request} req - The Express request object. Expected to have `db`, `schema`, `workspace`, and route params.
 * @param {Response} res - The Express response object. The fetched document is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const getDataEntityObject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters from the request are present.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.objectId) throw new iError(MISSING_ID);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        // --- 2. Determine DB Document Reference ---
        // Build the base path to the specific DB document to be fetched.
        let ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(OBJECTS).doc(req.params.objectId);

        // If route parameters for a nested document are present, refine the reference
        // to point to the specific document within the sub-collection.
        // e.g., /users/{userId}/posts/{postId}
        if (req.params.objectId && req.params.subDataEntity && req.params.subObjectId)
            ref = ref.collection(req.params.subDataEntity).doc(req.params.subObjectId);

        // --- 3. Delegate Fetch Operation to Controller ---
        // Pass the final, precise document reference to the get controller to
        // handle the actual database read operation.
        const { object, cached } = await getController(ref);

        // --- 4. Post-Retrieval Validation ---
        // Validate the fetched object against the provided schema to ensure
        // the data conforms to the expected structure.
        if (!req.objectSchema(object)) throw new iError(req.objectSchema.errors || []);

        // Attach the fetched document to `res.data` for use in subsequent middleware.
        res.data = object;
        cached && res.set(X_CACHED, TRUE);

        // --- 5. Completion ---
        // After successful document retrival, pass control to the next middleware.
        next();
    } catch (error) {
        // Pass any errors (e.g., validation failure, document not found)
        // to the global error handler.
        next(error);
    }
};

export default getDataEntityObject;
