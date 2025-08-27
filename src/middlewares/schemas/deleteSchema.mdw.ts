import { NextFunction, Request, Response } from 'express';

import { MISSING_DB_OBJECT, MISSING_SCHEMA_ID, MISSING_WORKSPACE, SCHEMA_NOT_FOUND } from '../../constants/errors.const.js';
import { OBJECT_SCHEMAS } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';

const deleteSchema = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);
        if (!req.params.schemaId) throw new iError(MISSING_SCHEMA_ID);

        let ref = req.db.collection(req.workspace).doc(req.params.schemaId);

        if (req.params.schemaId && !req.params.subSchemaId) ref = ref.collection(OBJECT_SCHEMAS).doc(req.params.schemaId);
        if (req.params.subSchemaId) ref = ref.collection(OBJECT_SCHEMAS).doc(req.params.subSchemaId);

        const snapshot = await ref.get();

        if (!snapshot.exists) throw new iError(SCHEMA_NOT_FOUND);

        await ref.delete();

        next();
    } catch (error) {
        next(error);
    }
};

export default deleteSchema;
