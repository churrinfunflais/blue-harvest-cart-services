import { JTDDataType } from 'ajv/dist/core.js';

import { ADDRESS, DELIVERY, SCHEDULE, STORE } from '../constants/strings.const.js';
import { DATE_TIME, NUMBER, OBJECT, STRING } from '../constants/types.const.js';

export const addressSchema = {
    $id: ADDRESS,
    properties: {
        city: { nullable: true, type: STRING },
        country: { nullable: true, type: STRING },
        geoCoordinates: {
            nullable: true,
            properties: {
                latitude: { type: NUMBER },
                longitude: { type: NUMBER },
            },
            type: OBJECT,
        },

        neighborhood: { type: STRING },
        street: { type: STRING },
        streetNumber: { type: STRING },
        zipCode: { nullable: true, type: STRING },
    },
    type: OBJECT,
} as const;

export const storeSchema = {
    $id: STORE,
    properties: {
        address: addressSchema,
        id: { type: STRING },
        name: { type: STRING },
    },
    type: OBJECT,
} as const;

export const scheduleSchema = {
    $id: SCHEDULE,
    properties: {
        from: { format: DATE_TIME, type: STRING },
        to: { format: DATE_TIME, type: STRING },
    },
    type: OBJECT,
} as const;

export const deliverySchema = {
    $id: DELIVERY,
    properties: {
        address: addressSchema,
        schedule: scheduleSchema,
        store: storeSchema,
    },
    type: OBJECT,
} as const;

export type Address = JTDDataType<typeof addressSchema>;
export type Store = JTDDataType<typeof storeSchema>;
export type Schedule = JTDDataType<typeof scheduleSchema>;
export type Delivery = JTDDataType<typeof deliverySchema>;
