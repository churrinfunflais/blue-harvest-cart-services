/**
 * @file listDataEntityObjects.js
 * @description Express middleware for listing documents for a data entity.
 * It handles filtering, field selection, pagination, and total counts based on
 * query parameters and a provided schema.
 */

import { SchemaObject } from 'ajv';
import { NextFunction, Request, Response } from 'express';

import { MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../../constants/errors.const.js';
import { X_CACHED, X_TOTAL_COUNT } from '../../../constants/headers.const.js';
import { COMMA, OBJECTS, TRUE } from '../../../constants/strings.const.js';
import listController from '../../../controllers/dataEntities/list.controller.js';
import { iError } from '../../../types/error.js';

/**
 * Lists data entity objects from db. This middleware is responsible
 * for parsing query parameters for filtering, field selection, and pagination.
 * It introspects the entity's schema to determine which fields are filterable
 * and then delegates the database query to a dedicated list controller.
 *
 * @param {Request} req - The Express request object. It reads query params like `limit`, `offset`, `fields`, etc.
 * @param {Response} res - The Express response object. The fetched list is attached to `res.data`.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {Promise<void>}
 */
const listDataEntityObjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // --- 1. Prerequisite Validation ---
        // Ensure all required objects and parameters are available on the request.
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.listSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_SCHEMA);

        // --- 2. Schema Introspection ---
        // Extract the schema definition to understand the structure of the data.
        const schema = req.listSchema?.schema as SchemaObject;
        const schemaItems = schema?.items as SchemaObject;
        const schemaProperties = schemaItems?.properties as SchemaObject;
        const schemaRequired = schemaItems?.required as string[];

        // --- 3. Determine Collection Reference ---
        // Build the base path for the collection to be queried.
        let ref = req.db.collection(req.workspace).doc(req.params.dataEntity).collection(OBJECTS);

        // If route parameters indicate a sub-collection, refine the reference.
        // This allows listing nested objects, e.g., /users/{userId}/posts.
        if (req.params.objectId && req.params.subDataEntity) ref = ref.doc(req.params.objectId).collection(req.params.subDataEntity);

        // --- 4. Process Filters and Field Selection ---
        // Determine which fields are allowed to be filtered by introspecting the schema.
        const schemaFilters = Object.entries(schemaProperties)
            ?.filter(([_key, { filter }]) => filter === true)
            ?.map(([key, _value]) => key);

        // Extract the filters provided in the request's query string that are valid.
        const filters = Object.entries(req.query)?.filter(([key, _value]) => schemaFilters?.includes(key));

        // Determine which fields to select from the documents based on the `fields` query parameter.
        const schemaFields = Object.keys(schemaProperties)
            ?.filter((key) => req.query.fields?.split(COMMA)?.includes(key))
            ?.map((key) => key);

        const fields = (schemaFields.length && [...schemaFields, ...schemaRequired]) || [];

        // --- 5. Delegate Fetch Operation to Controller ---
        // Pass the collection reference and all processed query parameters to the list controller.
        const { objectList, count, cached } = await listController(
            ref,
            filters,
            req.query.limit,
            req.query.offset,
            req.query.contextSearch,
            req.query.countTotal === TRUE,
            fields,
            req.query.consistentRead === TRUE
        );

        // --- 6. Post-Retrieval Validation ---
        // Validate the list of fetched objects against the schema.
        if (!req.listSchema(objectList)) throw new iError(req.listSchema.errors || []);

        // Attach the list to `res.data` for subsequent middleware.
        res.data = objectList;
        count && res.set(X_TOTAL_COUNT, `${count}`);
        cached && res.set(X_CACHED, TRUE);

        // --- 7. Completion ---
        // After successfully listing the collection documents, pass control to the next middleware.
        next();
    } catch (error) {
        // Pass any errors to the global error handler.
        next(error);
    }
};

export default listDataEntityObjects;
