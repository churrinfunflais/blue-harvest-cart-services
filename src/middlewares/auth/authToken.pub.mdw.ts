import { NextFunction, Request, Response } from 'express';

import { verifyPassword } from '../../clients/idp.client.js';
import { INVALID_CREDENTIALS, MISSING_DB_OBJECT, MISSING_WORKSPACE } from '../../constants/errors.const.js';
import { iError } from '../../types/error.js';
import { decrypt } from '../../utils/getEncrypt.js';

const authToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const { apiToken } = req.body as { apiToken: string };
        const { email, password } = JSON.parse(decrypt(apiToken)) as { email: string; password: string };

        if (!email || !password) throw new Error(INVALID_CREDENTIALS);

        const accessToken = await verifyPassword({
            email,
            password,
            returnSecureToken: true,
            workspace: req.workspace,
        });

        res.data = accessToken;
        next();
    } catch (error) {
        next(error);
    }
};

export default authToken;
