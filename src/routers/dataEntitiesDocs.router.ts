import { Router } from 'express';
import helmet from 'helmet';

import { OPENAPI_JSON, ROOT } from '../constants/paths.const.js';
import openApiSchemaGen from '../middlewares/dataEntities/openApi/openApiSchemaGen.mdw.js';
import redocDef from '../middlewares/dataEntities/openApi/redocDef.mdw.js';
import respond from '../middlewares/utils/respond.mdw.js';

export const dataEntitiesDocsRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

dataEntitiesDocsRouter.use(OPENAPI_JSON, openApiSchemaGen);

dataEntitiesDocsRouter.get(
    ROOT,
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                'script-src': ["'self'", 'https://cdn.redoc.ly', 'blob:'],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
    redocDef,
    respond
);
