/**
 * @file updateDataEntityObject.js
 * @description Express middleware for updating an existing document.
 * It validates the incoming request body, determines the correct document path
 * (including for sub-collections), and uses a controller to perform the
 * database update operation.
 */
import { DocumentData } from '@google-cloud/firestore';
import { NextFunction, Request, Response } from 'express';

import {
    MISSING_DATA,
    MISSING_DB_OBJECT,
    MISSING_OBJECT_ID,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
    OBJECT_ID_MISMATCH,
} from '../../../constants/errors.const.js';
import { OBJECTS } from '../../../constants/strings.const.js';
import updateController from '../../../controllers/dataEntities/update.controller.js';
import { iError } from '../../../types/error.js';

/**
 * Updates a data entity object in the db. This middleware handles
 * pre-update validation of the request body against a schema, determines
 * the precise document to update, extracts searchable fields, delegates
 * the update logic to a controller, and validates the final object.
 *
 * @param {Request} req - The Express request object. Expected to have `db`, `body`, `schema`, `workspace`, and route params.
 * @param {Response} res - The Express response object. The updated object is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const updateDataEntityObject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_DATA);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_SCHEMA);
        if (!req.params.objectId) throw new iError(MISSING_OBJECT_ID);

        const data = req.body as DocumentData;

        // --- 2. Initial Schema Validation ---
        // Validate the incoming request body to ensure it conforms to the schema before proceeding.
        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        // --- 3. Determine DB Document Reference ---
        // Build the base path to the specific DB document that will be updated.
        let ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(OBJECTS).doc(req.params.objectId);

        // Introspect the schema to find which field is designated as the 'objectId'.
        // This allows the client to specify a custom document ID.
        const objectIdParam = Object.entries((req.objectSchema.schema as DocumentData)?.properties as DocumentData)
            ?.filter(([_key, { objectId }]) => objectId === true)
            ?.map(([key, _value]) => key)
            ?.shift() as string;

        if (objectIdParam && req.params.objectId !== data[objectIdParam]) throw new iError(OBJECT_ID_MISMATCH, 404);

        // If route parameters for a nested document are present, refine the reference
        // to point to the specific document within the sub-collection.
        if (req.params.objectId && req.params.subDataEntity && req.params.subObjectId)
            ref = ref.collection(req.params.subDataEntity).doc(req.params.subObjectId);

        // --- 4. Extract Searchable Fields from Schema ---
        // Introspect the schema to find fields marked as 'searchable'. This metadata
        // will be passed to the controller, likely for updating a search index.
        const searchableFields = Object.entries((req.objectSchema.schema as DocumentData)?.properties as DocumentData)
            ?.filter(([_key, { searchable }]) => searchable === true)
            ?.map(([key, _value]) => key);

        // --- 5. Delegate Update Operation to Controller ---
        // Pass the update payload, document reference, and searchable fields to the controller.
        const newObject = await updateController(data, ref, searchableFields, req.user);

        // --- 6. Post-Update Validation ---
        // Re-validate the object returned from the controller to ensure data integrity
        // after any transformations or merges within the controller.
        if (!req.objectSchema(newObject)) throw new iError(req.objectSchema.errors || []);

        // Attach the updated object to `res.data` for use in subsequent middleware.
        res.data = newObject;
        res.status(200);

        // --- 7. Completion ---
        // After successfully updating the document, pass control to the next middleware.
        next();
    } catch (error) {
        // Pass any errors to the global error handler for a consistent response.
        next(error);
    }
};

export default updateDataEntityObject;
