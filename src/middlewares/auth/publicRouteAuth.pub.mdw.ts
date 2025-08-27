import { NextFunction, Request, Response } from 'express';

import { FORBIDDEN, UNAUTHORIZED } from '../../constants/errors.const.js';
import { CREATE, DELETE, GET, PATCH, POST, PUBLIC, READ, UPDATE } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';
import { JsonSchema } from '../../types/JsonSchema.js';

const publicRouteAuth = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        if (!req.public) return next();

        const reqType =
            (req.method === POST && CREATE) || (req.method === PATCH && UPDATE) || (req.method === DELETE && DELETE) || (req.method === GET && READ);

        if (!reqType) throw new iError(FORBIDDEN, 403);

        const schema = req.objectSchema?.schema as JsonSchema;
        const security = schema.security;

        if (!security) throw new iError(UNAUTHORIZED, 401);
        if (!security[reqType]?.includes(PUBLIC)) throw new iError(UNAUTHORIZED, 401);

        next();
    } catch (error) {
        next(error);
    }
};

export default publicRouteAuth;
