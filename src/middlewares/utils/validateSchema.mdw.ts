import { SchemaObject } from 'ajv';
import { NextFunction, Request, Response } from 'express';

import { INVALID_REQUEST_BODY, MISSING_SCHEMA } from '../../constants/error.const.js';
import { schemaBuilder } from '../../schemas/schemaBuilder.js';

export const validateSchema =
    (schema: SchemaObject) =>
    (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (!schema) throw new Error(MISSING_SCHEMA);

            req.schema = schemaBuilder.getSchema(schema.$id as string) || schemaBuilder.compile(schema);

            if (req.body && !req.schema(req.body)) throw new iError({ details: req.schema.errors, message: INVALID_REQUEST_BODY, statusCode: 400 });

            next();
        } catch (error) {
            next(error);
        }
    };
