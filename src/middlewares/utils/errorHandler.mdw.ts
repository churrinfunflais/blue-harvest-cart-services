import { ErrorRequestHandler } from 'express';

import { iError } from '../../types/iError.js';

export const errorHandler: ErrorRequestHandler = (err: iError, _req, res, next) => {
    res.status(err.statusCode || 500);

    const errorObject = {
        details: err.details,
        message: err.message,
        stack: err.stack?.split('\n')?.[1]?.match(/at\s+(.+?)\s+\(/)?.[1],
        statusCode: err.statusCode,
    };

    res.send(errorObject);
    next();
};
