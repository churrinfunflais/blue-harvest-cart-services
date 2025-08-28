import { JTDDataType } from 'ajv/dist/core.js';

import { CART } from '../constants/strings.const.js';
import { ARRAY, OBJECT, STRING } from '../constants/types.const.js';
import { clientSchema } from './client.schema.js';
import { itemSchema } from './item.schema.js';
import { paymentSchema } from './payment.schema.js';
import { deliverySchema } from './shipping.schema.js';

export const cartSchema = {
    $id: CART,
    properties: {
        client: clientSchema,
        delivery: deliverySchema,
        id: { type: STRING },
        items: {
            items: itemSchema,
            type: ARRAY,
        },
        payments: {
            items: paymentSchema,
            type: ARRAY,
        },
    },
    type: OBJECT,
} as const;

export type Cart = JTDDataType<typeof cartSchema>;
