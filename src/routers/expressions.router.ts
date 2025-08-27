import { Router } from 'express';

import { EXPRESSION_ID, ROOT } from '../constants/paths.const.js';
import createExpression from '../middlewares/dataEntities/expressions/createExpresion.mdw.js';
import getExpression from '../middlewares/dataEntities/expressions/getExpression.mdw.js';
import listExpressions from '../middlewares/dataEntities/expressions/listExpressions.mdw.js';
import { fixedSchema } from '../middlewares/schemas/schemaFactory.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';
import { expressionSchema } from '../schemas/expression.js';

export const expressionsRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

expressionsRouter.post(ROOT, fixedSchema(expressionSchema), createExpression, respond);
expressionsRouter.patch(EXPRESSION_ID, fixedSchema(expressionSchema), createExpression, respond);
expressionsRouter.get(ROOT, fixedSchema(expressionSchema), listExpressions, respond);
expressionsRouter.get(EXPRESSION_ID, fixedSchema(expressionSchema), getExpression, respond);
