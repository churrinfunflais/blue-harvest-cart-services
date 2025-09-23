import { JTDDataType } from 'ajv/dist/core.js';

import { DISCOUNT, ITEM } from '../constants/strings.const.js';
import { ARRAY, NUMBER, OBJECT, STRING } from '../constants/types.const.js';

export const discountSchema = {
    $id: DISCOUNT,
    items: {
        properties: {
            id: { type: STRING },
            name: { type: STRING },
            value: { type: NUMBER },
        },
        type: OBJECT,
    },
    type: ARRAY,
} as const;

export const itemSchema = {
    $id: ITEM,
    properties: {
        comments: { nullable: true, type: STRING },
        discounts: {
            items: discountSchema,
            nullable: true,
            type: ARRAY,
        },
        id: { type: STRING },
        messages: {
            items: { type: STRING },
            nullable: true,
            type: ARRAY,
        },
        name: { type: STRING },
        price: { type: NUMBER },
        quantity: { type: NUMBER },
    },
    type: OBJECT,
} as const;

export type Item = JTDDataType<typeof itemSchema>;
export type Discount = JTDDataType<typeof discountSchema>;
