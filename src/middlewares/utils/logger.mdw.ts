import { Request } from 'express';
import morgan from 'morgan';

import { LOGING_MODE } from '../../config.js';
import { BODY, HEADERS } from '../../constants/strings.const.js';

morgan.token(BODY, (req: Request) => {
    return JSON.stringify(req.body);
});

morgan.token(HEADERS, (req: Request) => {
    return JSON.stringify(req.headers);
});

export const logger = morgan(LOGING_MODE);
