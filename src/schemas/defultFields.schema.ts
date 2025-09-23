import { JTDDataType } from 'ajv/dist/core.js';

import { DEFAULT_FIELDS } from '../constants/strings.const.js';
import { DATE_TIME, NUMBER, OBJECT, STRING } from '../constants/types.const.js';

export const defaultFieldsSchema = {
    $id: DEFAULT_FIELDS,
    properties: {
        createdAt: { default: null, format: DATE_TIME, nullable: true, type: STRING },
        ttl: { default: null, nullable: true, type: NUMBER },
        updatedAt: { default: null, format: DATE_TIME, nullable: true, type: STRING },
    },
    type: OBJECT,
} as const;

export type DefaultFields = JTDDataType<typeof defaultFieldsSchema>;
