import { Router } from 'express';

import { ROOT, SCHEMA_ID, SUB_SCHEMA_ID, SUB_SCHEMAS } from '../constants/paths.const.js';
import createSchema from '../middlewares/schemas/createSchema.mdw.js';
import deleteSchema from '../middlewares/schemas/deleteSchema.mdw.js';
import getSchema from '../middlewares/schemas/getSchema.mdw.js';
import listSchemas from '../middlewares/schemas/listSchemas.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import validateSchema from '../middlewares/schemas/validateSchema.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { schemaSchema } from '../schemas/schema.js';

export const schemasRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

schemasRouter.get([ROOT], fixedSchema(schemaSchema), listSchemas, respond);
schemasRouter.post([ROOT, SUB_SCHEMAS], fixedSchema(schemaSchema), validateSchema, createSchema, respond);

schemasRouter.get([SCHEMA_ID, SUB_SCHEMA_ID], fixedSchema(schemaSchema), getSchema, respond);
schemasRouter.patch([SCHEMA_ID, SUB_SCHEMA_ID], fixedSchema(schemaSchema), validateSchema, createSchema, respond);
schemasRouter.delete([SCHEMA_ID, SUB_SCHEMA_ID], fixedSchema(schemaSchema), deleteSchema, respond);
