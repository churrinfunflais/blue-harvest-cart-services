import { AnyValidateFunction } from 'ajv/dist/core.js';

import { ENTITY_NOT_FOUND, SCHEMA_NOT_FOUND } from '../constants/errors.const.js';
import { ARRAY, DATE_TIME, EMAIL, NULL, OBJECT, SCHEMA_LIST, SCHEMAS, STRING } from '../constants/strings.const.js';
import { workspaceCache } from '../middlewares/workspace/workspace.mdw.js';
import { iError } from '../types/error.js';
import { JsonSchema } from '../types/JsonSchema.js';
import { schemaValidator } from './index.js';

const getEntitySchema = (workspace: string, entity: string, subEntity?: string): AnyValidateFunction[] => {
    const entityData = workspaceCache.get(`${workspace}/${entity}`) as { objectSchemas: JsonSchema[] };

    const entityDataSchema = entityData?.objectSchemas?.find((i) => i.$id === entity);
    const subEntityDataSchema = entityData?.objectSchemas?.find((i) => i.$id === subEntity);

    if (subEntity && (!subEntityDataSchema || !subEntityDataSchema?.$id)) throw new iError(ENTITY_NOT_FOUND);

    const entitySchema = (subEntity && subEntityDataSchema) || entityDataSchema;
    const entitySchemaId = (subEntity && `${entityDataSchema?.$id}/${subEntityDataSchema?.$id}`) || entityDataSchema?.$id;

    if (!entitySchema || !entitySchemaId) throw new iError(ENTITY_NOT_FOUND);

    const objectSchemaId = `${workspace}/${SCHEMAS}/${entitySchemaId}`;
    const listSchemaId = `${workspace}/${SCHEMAS}/${entitySchemaId}/${SCHEMA_LIST}`;

    const currentListSchema = schemaValidator.getSchema(listSchemaId);
    const currentObjectSchema = schemaValidator.getSchema(objectSchemaId);

    if (currentListSchema && currentObjectSchema) return [currentObjectSchema, currentListSchema];

    const defaultParams = {
        createdAt: { format: DATE_TIME, type: STRING },
        createdBy: {
            default: null,
            properties: {
                email: { format: EMAIL, type: STRING },
                id: { type: STRING },
            },
            type: [OBJECT, NULL],
        },
        objectId: { type: STRING },
        updatedAt: { format: DATE_TIME, type: STRING },
        updatedBy: {
            default: null,
            properties: {
                email: { format: EMAIL, type: STRING },
                id: { type: STRING },
            },
            type: [OBJECT, NULL],
        },
    };

    const newObjectSchema = schemaValidator.compile({
        ...entitySchema,
        $id: objectSchemaId,
        properties: {
            ...entitySchema.properties,
            ...defaultParams,
        },
    });
    const newListSchema = schemaValidator.compile({
        $id: listSchemaId,
        items: {
            ...entitySchema,
            properties: {
                ...entitySchema.properties,
                ...defaultParams,
            },
        },
        type: ARRAY,
    });

    if (!newObjectSchema || !newListSchema) throw new iError(SCHEMA_NOT_FOUND);

    return [newObjectSchema, newListSchema];
};

export default getEntitySchema;
