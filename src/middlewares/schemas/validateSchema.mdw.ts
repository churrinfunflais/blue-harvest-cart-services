import { Ajv, SchemaObject } from 'ajv';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';

import {
    INVALID_SCHEMA,
    MISSING_BODY,
    MISSING_DB_OBJECT,
    MISSING_SCHEMA,
    MISSING_WORKSPACE,
    ROLES_NOT_ALLOWED,
    SCHEMA_ID_MISMATCH,
} from '../../constants/errors.const.js';
import { CONFIG, ROLES, SUB_SCHEMAS } from '../../constants/strings.const.js';
import { schemasDefaultConfig } from '../../schemas/index.js';
import { iError } from '../../types/error.js';
import { JsonSchema } from '../../types/JsonSchema.js';

const validateSchema = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.db) throw new iError(MISSING_DB_OBJECT);
        if (!req.body) throw new iError(MISSING_BODY);
        if (!req.objectSchema) throw new iError(MISSING_SCHEMA);
        if (!req.workspace) throw new iError(MISSING_WORKSPACE);

        const newSchema = req.body as JsonSchema;
        if (req.params.schemaId && !req.url.includes(SUB_SCHEMAS) && req.params.schemaId !== newSchema.$id) throw new iError(SCHEMA_ID_MISMATCH, 404);
        if (req.params.schemaId && req.params.subSchemaId && req.params.subSchemaId !== newSchema.$id) throw new iError(SCHEMA_ID_MISMATCH, 404);

        // Validate the new schema against the schema validator.
        const localAjv: Ajv = new Ajv(schemasDefaultConfig);
        addFormats.default(localAjv);

        const { errors, schema } = localAjv.compile(newSchema);

        if (errors) throw new iError(errors);
        if (!localAjv.validateSchema(schema)) throw new iError(INVALID_SCHEMA);

        // Extract the schema definition to understand the structure of the data security roles.
        const schemaProperties = (schema as SchemaObject)?.properties as SchemaObject;

        if (!schemaProperties) throw new iError(INVALID_SCHEMA);

        const schemaSecurity = (schema as SchemaObject)?.security as SchemaObject;
        const schemaSecurityRoles = (schemaSecurity && (Object.values(schemaSecurity)?.flat() as string[])) || [];
        const schemaPropertiesSecurityRoles =
            (Object.entries(schemaProperties)
                ?.filter(([_key, { security }]) => security)
                ?.map(([_key, { security }]) => security as object)
                ?.reduce((_prev, curr) => (Object.values(curr) as string[])?.flat(), []) as string[]) || [];
        const schemaRoles = [...new Set([...schemaSecurityRoles, ...schemaPropertiesSecurityRoles])];

        const rolesSnapshot = await req.db.collection(req.workspace).doc(CONFIG).collection(ROLES).get();
        const roles = rolesSnapshot.docs?.map((i) => i.data())?.map((i) => i.name as string);
        const rolesNotAllowed = schemaRoles?.filter((i) => !roles?.includes(i));

        if (rolesNotAllowed?.length) throw new iError(ROLES_NOT_ALLOWED(rolesNotAllowed), 404);

        next();
    } catch (error) {
        next(error);
    }
};

export default validateSchema;
