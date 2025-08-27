import { KeywordDefinition, SchemaObject } from 'ajv/dist/core.js';

import { OBJECT_ID_PARAM_AS_REQUIRED, TOO_MANY_FILTERS, TOO_MANY_SEARCHABLE_PARAMS, TOO_MANY_UNIQUE_PARAMS } from '../constants/errors.const.js';
import { ARRAY, BOOLEAN, FILTER, OBJECT, OBJECT_ID, SEARCHABLE, SECURITY, STRING } from '../constants/strings.const.js';

export const objectIdKeyword: KeywordDefinition = {
    compile: (_schemaValue, _parentSchema, it) => {
        const schemaProperties = ((it.schemaEnv.schema as SchemaObject)?.properties as SchemaObject) || {};
        const required = (it.schemaEnv.schema as SchemaObject)?.required as string[];
        const entries = Object.entries(schemaProperties)
            ?.filter(([_key, { objectId }]) => objectId === true)
            ?.map(([key, _value]) => key);

        if (entries?.length > 1) throw new Error(TOO_MANY_UNIQUE_PARAMS);

        const intersecction = entries?.filter((entry) => required?.includes(entry));
        if (entries?.length && intersecction?.length < 1) throw new Error(OBJECT_ID_PARAM_AS_REQUIRED);

        return () => true;
    },
    keyword: OBJECT_ID,

    metaSchema: {
        type: BOOLEAN,
    },
    schemaType: BOOLEAN,
    type: STRING,
};

export const filterKeyword: KeywordDefinition = {
    compile: (_schemaValue, _parentSchema, it) => {
        const schemaProperties = ((it.schemaEnv.schema as SchemaObject)?.properties as SchemaObject) || {};
        const entries = Object.entries(schemaProperties)
            ?.filter(([_key, { filter }]) => filter === true)
            ?.map(([key, _value]) => key);

        if (entries?.length > 10) throw new Error(TOO_MANY_FILTERS);
        return () => true;
    },
    keyword: FILTER,
    schemaType: BOOLEAN,
    type: [STRING, BOOLEAN],
};

export const searchableKeyword: KeywordDefinition = {
    compile: (_schemaValue, _parentSchema, it) => {
        const schemaProperties = ((it.schemaEnv.schema as SchemaObject)?.properties as SchemaObject) || {};
        const entries = Object.entries(schemaProperties)
            ?.filter(([_key, { searchable }]) => searchable === true)
            ?.map(([key, _value]) => key);

        if (entries?.length > 10) throw new Error(TOO_MANY_SEARCHABLE_PARAMS);
        return () => true;
    },
    keyword: SEARCHABLE,
    schemaType: BOOLEAN,

    type: STRING,
};

export const securityKeyword: KeywordDefinition = {
    keyword: SECURITY,
    metaSchema: {
        additionalProperties: false,
        properties: {
            create: {
                items: { type: STRING },
                type: ARRAY,
            },
            delete: {
                items: { type: STRING },
                type: ARRAY,
            },
            list: {
                items: { type: STRING },
                type: ARRAY,
            },
            read: {
                items: { type: STRING },
                type: ARRAY,
            },
            update: {
                items: { type: STRING },
                type: ARRAY,
            },
        },
        type: OBJECT,
    },

    validate: () => true,
};
