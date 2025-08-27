/**
 * @file createDataEntityObject.js
 * @description Express middleware for creating a new document for a data entity.
 * This file handles both single document creation and batch creation if the
 * request body is an array. It validates the incoming data, determines the correct
 * DB collection path, and uses a controller to perform the write operation(s).
 */
import { DocumentData } from '@google-cloud/firestore';
import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { OBJECTS } from '../../../constants/strings.const.js';
import createController from '../../../controllers/dataEntities/create.controller.js';
import { iError } from '../../../types/error.js';

/**
 * Creates a new data entity object in the DB. This is the primary function that
 * also acts as a router. If the request body is an array, it delegates the request
 * to the batch creation handler; otherwise, it processes a single object creation.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const createDataEntityObject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required data and objects are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_DATA);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_SCHEMA);

        // --- 2. Initial Schema Validation ---
        // Validate the incoming request body against the provided schema function.
        const data = req.body as DocumentData;
        // If validation fails, throw an error with the detailed validation errors.
        if (!req.objectSchema(data)) throw new iError(req.objectSchema.errors || []);

        // --- 3. Determine Collection Reference ---
        // Build the base path for the collection where the new object will be stored.
        let ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(OBJECTS);

        // If the route includes parameters for a sub-collection, append them to the reference.
        // This allows creating objects within nested collections, e.g., /users/{userId}/posts.
        if (req.params.objectId && req.params.subDataEntity) ref = ref.doc(req.params.objectId).collection(req.params.subDataEntity);

        // --- 4. Extract Metadata from Schema ---
        // Introspect the schema to find fields marked as 'searchable'.
        // This metadata will be used by the controller, likely for indexing.
        const searchableFields = Object.entries((req.objectSchema.schema as DocumentData)?.properties as DocumentData)
            ?.filter(([_key, { searchable }]) => searchable === true)
            ?.map(([key, _value]) => key);

        // Introspect the schema to find which field is designated as the 'objectId'.
        // This allows the client to specify a custom document ID.
        const objectIdParam = Object.entries((req.objectSchema.schema as DocumentData)?.properties as DocumentData)
            ?.filter(([_key, { objectId }]) => objectId === true)
            ?.map(([key, _value]) => key)
            ?.shift() as string;

        // --- 5. Finalize Document Reference and Create Object ---
        // If a custom objectId was provided in the data, use it to create a doc reference.
        // Otherwise, call .doc() with no arguments to let auto-generate an ID.
        const objectId = data[objectIdParam] as string;

        const finalRef = (objectId && ref.doc(objectId)) || ref.doc();

        // Delegate the actual database write operation to the create controller.
        const newObject = await createController(data, finalRef, searchableFields, req.user);

        // --- 6. Post-Creation Validation ---
        // Re-validate the object returned from the controller to ensure data integrity
        // after any potential transformations within the controller.
        if (!req.objectSchema(newObject)) throw new iError(req.objectSchema.errors || []);

        // Attach the newly created object to `res.data` so subsequent middleware can use it.
        res.data = newObject;
        res.status(201);

        // --- 7. Completion ---
        // After successfully creating the document, pass control to the next middleware.
        next();
    } catch (error) {
        // If any part of the process fails, pass the error to the Express
        // global error handler.
        next(error);
    }
};

export default createDataEntityObject;
