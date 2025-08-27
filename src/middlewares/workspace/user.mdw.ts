import { NextFunction, Request, Response } from 'express';

import { X_GOOG_AUTHENTICATED_USER_EMAIL, X_GOOG_AUTHENTICATED_USER_ID } from '../../constants/headers.const.js';

const user = (req: Request, _res: Response, next: NextFunction): void => {
    try {
        const email = (req.headers[X_GOOG_AUTHENTICATED_USER_EMAIL] as string) || null;
        const id = (req.headers[X_GOOG_AUTHENTICATED_USER_ID] as string) || null;

        req.user = null;

        if (email && id) req.user = { email, id };

        next();
    } catch (error) {
        next(error);
    }
};

export default user;
