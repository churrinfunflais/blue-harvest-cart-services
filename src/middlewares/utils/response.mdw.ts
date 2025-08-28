import { NextFunction, Request, Response } from 'express';

export const response = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send(res.data);
        next();
    } catch (error) {
        next(error);
    }
};
