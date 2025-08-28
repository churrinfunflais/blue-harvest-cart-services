import { JTDDataType } from 'ajv/dist/core.js';

import { ARRAY, NUMBER, OBJECT, STRING } from '../constants/types.const.js';

export const itemSchema = {
    properties: {
        comments: { nullable: true, type: STRING },
        discounts: {
            items: {
                properties: {
                    id: { type: STRING },
                    name: { type: STRING },
                    value: { type: NUMBER },
                },
                type: OBJECT,
            },
            type: ARRAY,
        },
        id: { type: STRING },
        messages: {
            items: { type: STRING },
            type: ARRAY,
        },
        name: { type: STRING },
        price: { type: NUMBER },
        quantity: { type: NUMBER },
    },
    type: OBJECT,
} as const;

export type Item = JTDDataType<typeof itemSchema>;
