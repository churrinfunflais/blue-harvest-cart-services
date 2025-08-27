import { Ajv } from 'ajv';
import { CurrentOptions } from 'ajv/dist/core.js';
import addFormats from 'ajv-formats';

import { filterKeyword, objectIdKeyword, searchableKeyword, securityKeyword } from './keywords.js';

export const schemasDefaultConfig: CurrentOptions = {
    allErrors: true,
    coerceTypes: true,
    discriminator: true,
    keywords: [objectIdKeyword, filterKeyword, searchableKeyword, securityKeyword],
    removeAdditional: true,
    strict: true,
    strictSchema: true,
    useDefaults: true,
    validateFormats: true,
    verbose: false,
};

export const schemaValidator = new Ajv(schemasDefaultConfig);

addFormats.default(schemaValidator);
