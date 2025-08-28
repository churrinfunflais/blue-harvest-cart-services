import 'express';

import { ValidateFunction } from 'ajv';

declare module 'express' {
    interface Request {
        schema?: ValidateFunction;
        params: {
            cartId?: string;
        };
    }

    interface Response {
        data?: object | string;
    }
}
