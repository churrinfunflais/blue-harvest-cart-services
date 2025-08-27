import { SchemaObject } from 'ajv';
import { NextFunction, Request, Response } from 'express';

import { MISSING_DATA_ENTITY, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../constants/errors.const.js';
import { X_SCHEMA } from '../../constants/headers.const.js';
import { PUB } from '../../constants/paths.const.js';
import { ARRAY, SCHEMA_LIST } from '../../constants/strings.const.js';
import refreshDataEntityCache from '../../handlers/workspace/refreshDataEntityCache.handler.js';
import getEntitySchema from '../../schemas/getEntitySchema.handler.js';
import { schemaValidator } from '../../schemas/index.js';
import { iError } from '../../types/error.js';

export const dataEntitySchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.dataEntity) throw new iError(MISSING_DATA_ENTITY);

        await refreshDataEntityCache(req.db, req.workspace, req.params.dataEntity);

        const [objectSchema, listSchema] = getEntitySchema(req.workspace, req.params.dataEntity, req.params.subDataEntity);

        req.objectSchema = objectSchema;
        req.listSchema = listSchema;
        req.public = req.baseUrl.includes(PUB);

        res.set(X_SCHEMA, (req.params.subDataEntity && `${req.params.dataEntity}/${req.params.subDataEntity}`) || req.params.dataEntity);
        next();
    } catch (error) {
        next(error);
    }
};

export const fixedSchema =
    (schema: SchemaObject) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!schema) throw new iError(MISSING_SCHEMA);

            req.objectSchema = schemaValidator.getSchema(schema.$id as string) || schemaValidator.compile(schema);
            req.listSchema =
                schemaValidator.getSchema(`${schema.$id}/${SCHEMA_LIST}`) ||
                schemaValidator.compile({
                    $id: `${schema.$id}/${SCHEMA_LIST}`,
                    items: {
                        ...schema,
                    },
                    type: ARRAY,
                });

            res.set(X_SCHEMA, schema.$id);
            next();
        } catch (error) {
            next(error);
        }
    };
