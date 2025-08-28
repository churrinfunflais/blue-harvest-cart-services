// eslint-disable-next-line simple-import-sort/imports
import { Ajv } from 'ajv';
import addFormats from 'ajv-formats';
import { CurrentOptions } from 'ajv/dist/core.js';

export const schemasDefaultConfig: CurrentOptions = {
    allErrors: true,
    coerceTypes: true,
    discriminator: true,
    removeAdditional: true,
    strict: true,
    useDefaults: true,
    validateFormats: true,
    verbose: false,
};

export const schemaBuilder = new Ajv(schemasDefaultConfig);

addFormats.default(schemaBuilder);
