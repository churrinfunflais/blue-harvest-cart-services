import { DocumentData, QuerySnapshot } from '@google-cloud/firestore';
import { NextFunction, Request, Response } from 'express';

import { BAD_REQUEST, INTERNAL_SERVER_ERROR, MISSING_DB_OBJECT, MISSING_WORKSPACE, NOT_FOUND } from '../../../constants/errors.const.js';
import { APPLICATION_JSON, X_LOGO, X_SCHEMA, X_TAG_GROUPS, X_TOTAL_COUNT, X_WORKSPACE } from '../../../constants/headers.const.js';
import {
    CONSISTEN_READ_DESCRIPTION,
    CREATE_ACTION,
    CREATE_ACTION_DESCRIPTION,
    CREATE_EXPRESSION,
    CREATE_EXPRESSION_DESCRIPTION,
    CREATE_SCHEMA,
    CREATE_SCHEMA_DESCRIPTION,
    CREATE_SUMMARY,
    CREATE_USER,
    CREATE_USER_DESCRIPTION,
    CREATE_WEBHOOK,
    CREATE_WEBHOOK_DESCRIPTION,
    DATA_ENTITY_DESCRIPTION,
    DELETE_ACTION,
    DELETE_ACTION_DESCRIPTION,
    DELETE_EXPRESSION,
    DELETE_EXPRESSION_DESCRIPTION,
    DELETE_SCHEMA,
    DELETE_SCHEMA_DESCRIPTION,
    DELETE_SUMMARY,
    DELETE_WEBHOOK,
    DELETE_WEBHOOK_DESCRIPTION,
    EXPRESSION_DESCRIPTION,
    FIELDS_DESCRIPTION,
    FILTER_DESCRIPTION,
    GET_ACTION,
    GET_ACTION_DESCRIPTION,
    GET_EXPRESSION,
    GET_EXPRESSION_DESCRIPTION,
    GET_SCHEMA,
    GET_SCHEMA_DESCRIPTION,
    GET_SUMMARY,
    GET_USER,
    GET_USER_DESCRIPTION,
    GET_WEBHOOK,
    GET_WEBHOOK_DESCRIPTION,
    LIMIT_DESCRIPTION,
    LIST_ACTIONS,
    LIST_ACTIONS_DESCRIPTION,
    LIST_EXPRESSIONS,
    LIST_EXPRESSIONS_DESCRIPTION,
    LIST_SCHEMAS,
    LIST_SCHEMAS_DESCRIPTION,
    LIST_SUMMARY,
    LIST_USERS,
    LIST_USERS_DESCRIPTION,
    LIST_WEBHOOKS,
    LIST_WEBHOOKS_DESCRIPTION,
    OBJECT_ID_DESCRIPTION,
    OFFSET_DESCRIPTION,
    OPEN_API_TITLE,
    SEARCH_DESCRIPTION,
    SUB_OBJECT_ID_DESCRIPTION,
    UPDATE_ACTION,
    UPDATE_ACTION_DESCRIPTION,
    UPDATE_EXPRESSION,
    UPDATE_EXPRESSION_DESCRIPTION,
    UPDATE_SCHEMA,
    UPDATE_SCHEMA_DESCRIPTION,
    UPDATE_SUMMARY,
    UPDATE_USER,
    UPDATE_USER_DESCRIPTION,
    UPDATE_WEBHOOK,
    UPDATE_WEBHOOK_DESCRIPTION,
} from '../../../constants/messages.const.js';
import { COMPONENTS_SCHEMAS, DATA_ENTITIES } from '../../../constants/paths.const.js';
import {
    ACTIONS,
    ADMIN,
    API_VERSION,
    ARRAY,
    BOOLEAN,
    COMMA_SPACE,
    CONSISTEN_READ,
    CONTEXT_SEARCH,
    DATA_ENTITIES_NAME,
    DATA_ENTITY,
    EMAIL,
    EXPRESSION,
    EXPRESSIONS,
    FALSE,
    FIELDS,
    LIMIT,
    NUMBER,
    NUMBER_200,
    NUMBER_201,
    NUMBER_400,
    NUMBER_404,
    NUMBER_500,
    OBJECT,
    OBJECT_ID,
    OBJECT_SCHEMAS,
    OFFSET,
    OPEN_API_VERSION,
    PATH,
    QUERY,
    SCHEMAS,
    STRING,
    STYRK_LOGO_B64,
    SUB_OBJECT_ID,
    SUCCESS,
    USERS,
    UTILS,
    WEBHOOKS,
} from '../../../constants/strings.const.js';
import { actionSchema } from '../../../schemas/action.js';
import { expressionSchema } from '../../../schemas/expression.js';
import { schemaSchema } from '../../../schemas/schema.js';
import { userSchema } from '../../../schemas/user.js';
import { webhookSchema } from '../../../schemas/webhook.js';
import { iError } from '../../../types/error.js';
import { JsonSchema } from '../../../types/JsonSchema.js';

// TODO: IMPLEMENT method level descriptions

const openApiSchemaGen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const entitiesSnapshot = await req.db.collection(req.workspace).get();
        const entitiesIds = entitiesSnapshot?.docs?.map((i) => i.id);
        const schemaListSnapshot: [string, QuerySnapshot<DocumentData, DocumentData>][] = await Promise.all(
            entitiesIds?.map(async (i) => [
                i,
                (await req.db
                    ?.collection(req.workspace as string)
                    .doc(i)
                    .collection(OBJECT_SCHEMAS)
                    .get()) as QuerySnapshot<DocumentData, DocumentData>,
            ])
        );

        const schemaList = schemaListSnapshot?.map(([entity, data]) => [entity, data?.docs?.map((doc) => doc.data() as JsonSchema)]);

        const tagGroups = schemaList?.flatMap(([entity, data]) =>
            (data as JsonSchema[]).map((i) => (i.$id === entity ? entity : `${entity as string} ${i.$id}`))
        );

        const schemas = schemaList
            ?.map(([_entity, data]) => (data as JsonSchema[]).map((i) => i))
            ?.flat()
            ?.reduce((acc, curr) => Object.assign({}, acc, { [curr.$id as string]: curr }), {});

        const dataEntityPaths = schemaList
            ?.reduce((acc, curr) => {
                const [entity, schemas] = curr as [string, JsonSchema[]];

                if (!schemas?.length) return acc;

                return [
                    ...acc,
                    objectSchema(schemas?.find((i) => i.$id === entity) as JsonSchema, entity),
                    ...(schemas
                        ?.filter((i) => i.$id !== entity)
                        ?.map((i) => objectSchema(i, entity, i.$id))
                        ?.flat() || []),
                ];
            }, [] as object[])
            ?.reduce((acc, curr) => Object.assign({}, acc, curr), {});

        const apiJson = {
            [X_TAG_GROUPS]: [
                {
                    name: DATA_ENTITIES_NAME,
                    tags: [...tagGroups.sort()],
                },
                {
                    name: UTILS,
                    tags: [WEBHOOKS, ACTIONS, EXPRESSIONS, SCHEMAS],
                },
                {
                    name: ADMIN,
                    tags: [USERS],
                },
            ],
            components: {
                schemas: {
                    ...schemas,
                    actions: actionSchema,
                    expressions: expressionSchema,
                    schemas: schemaSchema,
                    users: userSchema,
                    webhooks: webhookSchema,
                },
                securitySchemes: {},
            },
            info: {
                [X_LOGO]: {
                    url: STYRK_LOGO_B64,
                },
                title: OPEN_API_TITLE(req.workspace),
                version: API_VERSION,
            },
            openapi: OPEN_API_VERSION,
            paths: { ...dataEntityPaths, ...webhooksPaths, ...actionsPaths, ...expressionsPaths, ...schemasPaths, ...usersPaths },
        };

        res.send(apiJson);
    } catch (error) {
        next(error);
    }
};

const objectSchema = (schema: JsonSchema, entity?: string, subEntity?: string): object => ({
    [(!subEntity && `${DATA_ENTITIES}/${entity}`) || `${DATA_ENTITIES}/${entity}/{${OBJECT_ID}}/${subEntity}`]: {
        get: {
            parameters: [
                subEntity && {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OFFSET_DESCRIPTION,
                    in: QUERY,
                    name: OFFSET,
                    schema: {
                        type: NUMBER,
                    },
                },
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 100,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
                {
                    description: CONSISTEN_READ_DESCRIPTION,
                    in: QUERY,
                    name: CONSISTEN_READ,
                    required: false,
                    schema: {
                        default: FALSE,
                        type: BOOLEAN,
                    },
                },
                searchParams(schema.properties as object),
                filterParams(schema.properties as object),
                fieldsParams(schema.properties as object),
                expressionParams(),
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_SUMMARY((!subEntity && entity) || `${entity} ${subEntity}`),
            tags: [(!subEntity && entity) || `${entity} ${subEntity}`],
        },
        post: {
            parameters: [
                subEntity && {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_201]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                // [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_SUMMARY((!subEntity && entity) || `${entity} ${subEntity}`),
            tags: [(!subEntity && entity) || `${entity} ${subEntity}`],
        },
    },
    [(!subEntity && `${DATA_ENTITIES}/${schema.$id}/{${OBJECT_ID}}`) || `${DATA_ENTITIES}/${entity}/{${OBJECT_ID}}/${subEntity}/{${SUB_OBJECT_ID}}`]:
        {
            delete: {
                parameters: [
                    {
                        description: OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                    subEntity && {
                        description: SUB_OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: SUB_OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                ]
                    ?.flat()
                    ?.filter((i) => i),
                responses: {
                    [NUMBER_200]: {
                        content: {
                            [APPLICATION_JSON]: {
                                schema: {
                                    $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                                },
                            },
                        },
                        description: SUCCESS,
                        headers: {
                            ...defaultHeaders,
                        },
                    },
                    [NUMBER_400]: errorSchema(BAD_REQUEST),
                    [NUMBER_404]: errorSchema(NOT_FOUND),
                    [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
                },
                summary: DELETE_SUMMARY((!subEntity && entity) || `${entity} ${subEntity}`),
                tags: [(!subEntity && entity) || `${entity} ${subEntity}`],
            },
            get: {
                parameters: [
                    {
                        description: OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                    subEntity && {
                        description: SUB_OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: SUB_OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                    fieldsParams(schema.properties as object),
                    expressionParams(),
                ]
                    ?.flat()
                    ?.filter((i) => i),
                responses: {
                    [NUMBER_200]: {
                        content: {
                            [APPLICATION_JSON]: {
                                schema: {
                                    $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                                },
                            },
                        },
                        description: SUCCESS,
                        headers: {
                            ...defaultHeaders,
                        },
                    },
                    [NUMBER_400]: errorSchema(BAD_REQUEST),
                    [NUMBER_404]: errorSchema(NOT_FOUND),
                    [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
                },
                summary: GET_SUMMARY((!subEntity && entity) || `${entity} ${subEntity}`),
                tags: [(!subEntity && entity) || `${entity} ${subEntity}`],
            },
            patch: {
                parameters: [
                    {
                        description: OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                    subEntity && {
                        description: SUB_OBJECT_ID_DESCRIPTION,
                        in: PATH,
                        name: SUB_OBJECT_ID,
                        required: true,
                        schema: {
                            type: STRING,
                        },
                    },
                ]
                    ?.flat()
                    ?.filter((i) => i),
                requestBody: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                            },
                        },
                    },
                    required: true,
                },
                responses: {
                    [NUMBER_200]: {
                        content: {
                            [APPLICATION_JSON]: {
                                schema: {
                                    $ref: `${COMPONENTS_SCHEMAS}${schema.$id}`,
                                },
                            },
                        },
                        description: SUCCESS,
                        headers: {
                            ...defaultHeaders,
                        },
                    },
                    [NUMBER_400]: errorSchema(BAD_REQUEST),
                    [NUMBER_404]: errorSchema(NOT_FOUND),
                    [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
                },
                summary: UPDATE_SUMMARY((!subEntity && entity) || `${entity} ${subEntity}`),
                tags: [(!subEntity && entity) || `${entity} ${subEntity}`],
            },
        },
});

const errorSchema = (description: string): object => ({
    content: {
        [APPLICATION_JSON]: {
            schema: {
                properties: {
                    detail: {
                        items: {
                            properties: {
                                instancePath: {
                                    type: STRING,
                                },
                                keyword: {
                                    type: STRING,
                                },
                                message: {
                                    type: STRING,
                                },
                                params: {
                                    properties: {
                                        missingProperty: {
                                            type: STRING,
                                        },
                                    },
                                    type: OBJECT,
                                },
                                schemaPath: {
                                    type: STRING,
                                },
                            },
                            type: OBJECT,
                        },
                        nullable: true,
                        type: ARRAY,
                    },

                    message: {
                        nullable: true,
                        type: STRING,
                    },

                    stack: {
                        nullable: true,
                        type: STRING,
                    },
                    status: {
                        type: STRING,
                    },
                },
                type: OBJECT,
            },
        },
    },
    description,
});

const defaultHeaders = {
    [X_SCHEMA]: {
        schema: {
            type: STRING,
        },
    },
    [X_WORKSPACE]: {
        schema: {
            type: STRING,
        },
    },
};

const searchParams = (properties: object): object[] | void => {
    const params = Object.entries(properties)?.filter(([_key, { searchable }]) => searchable === true);
    const paramKeys = params?.map(([key]) => key)?.join(COMMA_SPACE);

    if (!params.length) return;

    return [
        {
            description: SEARCH_DESCRIPTION(paramKeys),
            in: QUERY,
            name: CONTEXT_SEARCH,
            required: false,
            schema: {
                type: STRING,
            },
        },
    ];
};

const fieldsParams = (properties: object): object | void => {
    const params = Object.keys(properties)?.join(COMMA_SPACE);

    return {
        description: FIELDS_DESCRIPTION(params),
        in: QUERY,
        name: FIELDS,
        required: false,
        schema: {
            type: STRING,
        },
    };
};

const expressionParams = (): object => {
    return {
        description: EXPRESSION_DESCRIPTION,
        in: QUERY,
        name: EXPRESSION,
        required: false,
        schema: {
            type: STRING,
        },
    };
};

const filterParams = (properties: object): object[] | void => {
    const filters = Object.entries(properties)
        ?.filter(([_key, { filter }]) => filter === true)
        ?.map(([key, _value]) => ({
            description: FILTER_DESCRIPTION(key),
            in: QUERY,
            name: key,
            required: false,
            schema: {
                type: STRING,
            },
        }))
        ?.filter((i) => i);

    if (!filters.length) return;

    return filters;
};

const webhooksPaths = {
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${WEBHOOKS}`]: {
        get: {
            description: LIST_WEBHOOKS_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 25,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_WEBHOOKS,
            tags: [WEBHOOKS],
        },
        post: {
            description: CREATE_WEBHOOK_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_WEBHOOK,
            tags: [WEBHOOKS],
        },
    },
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${WEBHOOKS}/{${OBJECT_ID}}`]: {
        delete: {
            description: DELETE_WEBHOOK_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: DELETE_WEBHOOK,
            tags: [WEBHOOKS],
        },
        get: {
            description: GET_WEBHOOK_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: GET_WEBHOOK,
            tags: [WEBHOOKS],
        },
        patch: {
            description: UPDATE_WEBHOOK_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${WEBHOOKS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: UPDATE_WEBHOOK,
            tags: [WEBHOOKS],
        },
    },
};

const actionsPaths = {
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${ACTIONS}`]: {
        get: {
            description: LIST_ACTIONS_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 25,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_ACTIONS,
            tags: [ACTIONS],
        },
        post: {
            description: CREATE_ACTION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_ACTION,
            tags: [ACTIONS],
        },
    },
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${ACTIONS}/{${OBJECT_ID}}`]: {
        delete: {
            description: DELETE_ACTION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: DELETE_ACTION,
            tags: [ACTIONS],
        },
        get: {
            description: GET_ACTION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: GET_ACTION,
            tags: [ACTIONS],
        },
        patch: {
            description: UPDATE_ACTION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${ACTIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: UPDATE_ACTION,
            tags: [ACTIONS],
        },
    },
};

const expressionsPaths = {
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${EXPRESSIONS}`]: {
        get: {
            description: LIST_EXPRESSIONS_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 25,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_EXPRESSIONS,
            tags: [EXPRESSIONS],
        },
        post: {
            description: CREATE_EXPRESSION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_EXPRESSION,
            tags: [EXPRESSIONS],
        },
    },
    [`${DATA_ENTITIES}/{${DATA_ENTITY}}/${EXPRESSIONS}/{${OBJECT_ID}}`]: {
        delete: {
            description: DELETE_EXPRESSION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: DELETE_EXPRESSION,
            tags: [EXPRESSIONS],
        },
        get: {
            description: GET_EXPRESSION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: GET_EXPRESSION,
            tags: [EXPRESSIONS],
        },
        patch: {
            description: UPDATE_EXPRESSION_DESCRIPTION,
            parameters: [
                {
                    description: DATA_ENTITY_DESCRIPTION,
                    in: PATH,
                    name: DATA_ENTITY,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${EXPRESSIONS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: UPDATE_EXPRESSION,
            tags: [EXPRESSIONS],
        },
    },
};

const schemasPaths = {
    [`${DATA_ENTITIES}/${SCHEMAS}`]: {
        get: {
            description: LIST_SCHEMAS_DESCRIPTION,
            parameters: [
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 25,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_SCHEMAS,
            tags: [SCHEMAS],
        },
        post: {
            description: CREATE_SCHEMA_DESCRIPTION,
            parameters: []?.flat()?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_SCHEMA,
            tags: [SCHEMAS],
        },
    },
    [`${DATA_ENTITIES}/${SCHEMAS}/{${OBJECT_ID}}`]: {
        delete: {
            description: DELETE_SCHEMA_DESCRIPTION,
            parameters: [
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: DELETE_SCHEMA,
            tags: [SCHEMAS],
        },
        get: {
            description: GET_SCHEMA_DESCRIPTION,
            parameters: [
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: GET_SCHEMA,
            tags: [SCHEMAS],
        },
        patch: {
            description: UPDATE_SCHEMA_DESCRIPTION,
            parameters: [
                {
                    description: OBJECT_ID_DESCRIPTION,
                    in: PATH,
                    name: OBJECT_ID,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${SCHEMAS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: UPDATE_SCHEMA,
            tags: [SCHEMAS],
        },
    },
};

const usersPaths = {
    [`${USERS}`]: {
        get: {
            description: LIST_USERS_DESCRIPTION,
            parameters: [
                {
                    description: OFFSET_DESCRIPTION,
                    in: QUERY,
                    name: OFFSET,
                    schema: {
                        type: NUMBER,
                    },
                },
                {
                    description: LIMIT_DESCRIPTION,
                    in: QUERY,
                    name: LIMIT,
                    required: false,
                    schema: {
                        default: 10,
                        maximum: 500,
                        minimum: 1,
                        type: NUMBER,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                items: {
                                    $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                                },
                                type: ARRAY,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                        [X_TOTAL_COUNT]: {
                            schema: {
                                type: STRING,
                            },
                        },
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: LIST_USERS,
            tags: [USERS],
        },
        post: {
            description: CREATE_USER_DESCRIPTION,
            parameters: []?.flat()?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: CREATE_USER,
            tags: [USERS],
        },
    },
    [`${USERS}/{${EMAIL}}`]: {
        get: {
            description: GET_USER_DESCRIPTION,
            parameters: [
                {
                    in: PATH,
                    name: EMAIL,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: GET_USER,
            tags: [USERS],
        },
        patch: {
            description: UPDATE_USER_DESCRIPTION,
            parameters: [
                {
                    in: PATH,
                    name: EMAIL,
                    required: true,
                    schema: {
                        type: STRING,
                    },
                },
            ]
                ?.flat()
                ?.filter((i) => i),
            requestBody: {
                content: {
                    [APPLICATION_JSON]: {
                        schema: {
                            $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                        },
                    },
                },
                required: true,
            },
            responses: {
                [NUMBER_200]: {
                    content: {
                        [APPLICATION_JSON]: {
                            schema: {
                                $ref: `${COMPONENTS_SCHEMAS}${USERS}`,
                            },
                        },
                    },
                    description: SUCCESS,
                    headers: {
                        ...defaultHeaders,
                    },
                },
                [NUMBER_400]: errorSchema(BAD_REQUEST),
                [NUMBER_404]: errorSchema(NOT_FOUND),
                [NUMBER_500]: errorSchema(INTERNAL_SERVER_ERROR),
            },
            summary: UPDATE_USER,
            tags: [USERS],
        },
    },
};

export default openApiSchemaGen;
