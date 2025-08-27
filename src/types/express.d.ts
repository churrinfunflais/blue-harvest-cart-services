import 'express';

import { Firestore } from '@google-cloud/firestore';
import { AnySchema, ValidateFunction } from 'ajv';

declare module 'express' {
    interface Request {
        workspace?: string;
        db?: Firestore;
        objectSchema?: ValidateFunction;
        listSchema?: ValidateFunction;
        public?: boolean;
        user?: {
            id: string;
            email: string;
        } | null;
        query: {
            limit?: string;
            offset?: string;
            contextSearch?: string;
            fields?: string;
            countTotal?: string;
            textSearch?: string;
            expression?: string;
            consistentRead?: string;
        };
        params: {
            dataEntity?: string;
            objectId?: string;
            subDataEntity?: string;
            subObjectId?: string;
            schemaId?: string;
            subSchemaId?: string;
            webhookId?: string;
            expressionId?: string;
            actionId?: string;
            roleId?: string;
            userId?: string;
        };
    }

    interface Response {
        data?: object | string | AnySchema;
    }
}
