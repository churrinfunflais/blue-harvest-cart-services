import { NextFunction, Request, Response } from 'express';

import { encrypt } from '../../utils/getEncrypt.js';

export const encriptToken = (_req: Request, res: Response, next: NextFunction): void => {
    try {
        res.data = {
            token: encrypt(JSON.stringify(res.data)),
        };

        next();
    } catch (error) {
        next(error);
    }
};
