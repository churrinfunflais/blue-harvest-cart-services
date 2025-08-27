import { JTDDataType } from 'ajv/dist/core.js';

import { EXPRESSION, OBJECT, STRING } from '../constants/strings.const.js';

export const expressionSchema = {
    $id: EXPRESSION,
    additionalProperties: false,

    description: 'Schema for configuring a JSONata expression, which is a lightweight query and transformation language for JSON data.',
    properties: {
        description: {
            description: 'A detailed, human-readable explanation of what the expression does, its inputs, and its expected output.',
            type: STRING,
        },
        expression: {
            description: 'The JSONata expression string itself. This is the core logic that will be evaluated against a JSON input.',
            type: STRING,
        },
        id: {
            description: 'A unique, system-generated identifier for the expression if not precent in the request.',
            type: STRING,
        },
    },
    required: [EXPRESSION],
    type: OBJECT,
};

export type Expression = JTDDataType<typeof expressionSchema>;
