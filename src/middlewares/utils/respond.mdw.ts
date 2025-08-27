import { NextFunction, Request, Response } from 'express';

const respond = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        res.send(res.data);
    } catch (error) {
        next(error);
    }
};

export default respond;
