import { NextFunction, Request, Response } from 'express';

export const getCartClient = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        res.data = {};
        next();
    } catch (error) {
        next(error);
    }
};
