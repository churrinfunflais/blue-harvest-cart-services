import { JTDDataType } from 'ajv/dist/core.js';

import { OBJECT, STRING } from '../constants/types.const.js';

export const clientSchema = {
    properties: {
        email: { type: STRING },
        firstName: { type: STRING },
        id: { type: STRING },
        lastName: { type: STRING },
        phone: { type: STRING },
    },
    type: OBJECT,
} as const;

export type Client = JTDDataType<typeof clientSchema>;
