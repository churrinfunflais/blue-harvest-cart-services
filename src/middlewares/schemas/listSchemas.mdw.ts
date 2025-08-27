import { NextFunction, Request, Response } from 'express';

import { MISSING_DB_OBJECT, MISSING_WORKSPACE } from '../../constants/errors.const.js';
import { OBJECT_SCHEMAS } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';

const listSchemas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const dataEntitiesSnapshot = await req.db.collection(req.workspace).get();
        const schemasList = dataEntitiesSnapshot?.docs?.map((i) => i.id);
        const schemas = await Promise.all(
            schemasList?.map(async (i) => {
                const schemasSnapshot = await req.db
                    ?.collection(req?.workspace as string)
                    .doc(i)
                    .collection(OBJECT_SCHEMAS)
                    .get();
                const schemasData = schemasSnapshot?.docs?.map((j) => j.data());

                const schemaObject = {
                    dataEntity: i,
                    schema: schemasData?.find((j) => j.$id === i),
                    subDataEntities: schemasData?.filter((j) => j.$id !== i)?.map((j) => ({ schema: j, subDataEntity: j.$id as string })),
                };

                return schemaObject;
            })
        );

        res.data = schemas;
        next();
    } catch (error) {
        next(error);
    }
};

export default listSchemas;
