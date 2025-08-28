import { JTDDataType } from 'ajv/dist/core.js';

import {
    AMEX,
    CASH,
    CREDIT_CARD,
    DEBIT_CARD,
    DINERS_CLUB,
    DISCOVER,
    GIFTCARD,
    MASTERCARD,
    NUMBER,
    OBJECT,
    PAYPAL,
    STRING,
    TYPE,
    VISA,
} from '../constants/types.const.js';

export const paymentSchema = {
    discriminator: { propertyName: TYPE },
    oneOf: [
        {
            properties: {
                [TYPE]: { const: CASH },
                id: { type: STRING },
                value: { type: NUMBER },
            },
            required: [TYPE, 'id', 'value'],
        },
        {
            properties: {
                [TYPE]: { const: CREDIT_CARD },
                id: { type: STRING },
                issuer: { enum: [MASTERCARD, VISA, AMEX, DISCOVER, DINERS_CLUB], type: STRING },
                value: { type: NUMBER },
            },
            required: [TYPE, 'id', 'issuer', 'value'],
        },
        {
            properties: {
                [TYPE]: { const: DEBIT_CARD },
                id: { type: STRING },
                issuer: { enum: [MASTERCARD, VISA, AMEX, DISCOVER, DINERS_CLUB], type: STRING },
                value: { type: NUMBER },
            },
            required: [TYPE, 'id', 'issuer', 'value'],
        },
        {
            properties: {
                [TYPE]: { const: GIFTCARD },
                id: { type: STRING },
                value: { type: NUMBER },
            },
            required: [TYPE, 'id', 'value'],
        },
        {
            properties: {
                [TYPE]: { const: PAYPAL },
                id: { type: STRING },
                value: { type: NUMBER },
            },
            required: [TYPE, 'id', 'value'],
        },
    ],
    type: OBJECT,
} as const;

export type Payment = JTDDataType<typeof paymentSchema>;
