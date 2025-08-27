import { SchemaObject } from 'ajv';

import { ARRAY, NAME, OBJECT, ROLE, STRING } from '../constants/strings.const.js';

//TODO: pass strings to constants
export const roleSchema: SchemaObject = {
    $id: ROLE,
    additionalProperties: false,
    description: 'Schema for configuring a role.',
    properties: {
        dataEntities: {
            default: [],
            items: {
                type: STRING,
            },
            readOnly: true,
            type: ARRAY,
        },
        description: {
            description: "A detailed explanation of the role's purpose and what it's used for.",
            type: STRING,
        },
        id: {
            description: 'A unique, system-generated identifier for the role if not precent in the request.',
            type: STRING,
        },
        name: {
            description: 'A human-readable name for the role to easily identify it.',
            type: STRING,
        },
    },
    required: [NAME],
    type: OBJECT,
};
