import { ErrorObject } from 'ajv/dist/core.js';
import { NextFunction, Request, Response } from 'express';

import { SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { ERROR } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';

export const errorHandler = (err: Error | iError | ErrorObject, _req: Request, res: Response, next: NextFunction): void => {
    const statusCode = (err instanceof iError && err.statusCode) || 500;

    const errorMessage = {
        detail: err instanceof iError && err.data,
        message: (err instanceof iError && err.message) || SOMETHING_WENT_WRONG,
        status: ERROR,
        ...(err instanceof iError && err.stack && { stack: err.stack }),
        ...(err instanceof Error && err.stack && { stack: err.stack }),
    };

    res.status(statusCode).send(errorMessage);

    next();
};
