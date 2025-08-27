import { NextFunction, Request, Response } from 'express';

import { INVALID_SCHEMA_ID, MISSING_BODY, MISSING_DB_OBJECT, MISSING_SCHEMA, MISSING_WORKSPACE } from '../../constants/errors.const.js';
import {
    ACTIONS,
    ARRAY,
    CONFIG,
    EXPRESSIONS,
    OBJECT_SCHEMAS,
    ROLES,
    SCHEMA_LIST,
    SCHEMAS,
    SECURITY,
    WEBHOOKS,
} from '../../constants/strings.const.js';
import { schemaValidator } from '../../schemas/index.js';
import { iError } from '../../types/error.js';
import { JsonSchema } from '../../types/JsonSchema.js';

const createSchema = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const newSchema = req.body as JsonSchema;
        const schemaId =
            (!req.params.schemaId && `${req.workspace}/${SCHEMAS}/${newSchema.$id}`) ||
            `${req.workspace}/${SCHEMAS}/${req.params.schemaId}/${newSchema.$id}`;
        const schemaIdList =
            (!req.params.schemaId && `${req.workspace}/${SCHEMAS}/${newSchema.$id}/${SCHEMA_LIST}`) ||
            `${req.workspace}/${SCHEMAS}/${req.params.schemaId}/${newSchema.$id}/${SCHEMA_LIST}`;

        const blackListId = [OBJECT_SCHEMAS, EXPRESSIONS, WEBHOOKS, ACTIONS, ROLES, CONFIG, SCHEMAS, SCHEMA_LIST, SECURITY];

        if (blackListId.includes(newSchema.$id as string)) throw new iError(INVALID_SCHEMA_ID);
        if (!req.objectSchema(newSchema)) throw new iError(req.objectSchema.errors || []);

        if (schemaValidator.getSchema(schemaId)) schemaValidator.removeSchema(schemaId);
        if (schemaValidator.getSchema(schemaIdList)) schemaValidator.removeSchema(schemaIdList);

        schemaValidator.compile({ ...newSchema, $id: schemaId });
        schemaValidator.compile({
            $id: schemaIdList,
            items: { ...newSchema },
            type: ARRAY,
        });

        if (!req.params.schemaId) {
            await req.db
                .collection(req.workspace)
                .doc(newSchema.$id as string)
                .collection(OBJECT_SCHEMAS)
                .doc(newSchema.$id as string)
                .set(newSchema);
            await req.db
                .collection(req.workspace)
                .doc(newSchema.$id as string)
                .set({ id: newSchema.$id });
        }

        if (req.params.schemaId) {
            await req.db
                .collection(req.workspace)
                .doc(req.params.schemaId)
                .collection(OBJECT_SCHEMAS)
                .doc(newSchema.$id as string)
                .set(newSchema);
        }

        res.data = newSchema;
        res.status(201);

        next();
    } catch (error) {
        next(error);
    }
};

export default createSchema;
