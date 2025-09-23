import { NextFunction, Request, Response } from 'express';

export const response = (req: Request, res: Response, next: NextFunction): void => {
    try {
        if (res.data && req.schema) req.schema(res.data);

        res.send(res.data);
        next();
    } catch (error) {
        next(error);
    }
};
