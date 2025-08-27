import { JTDDataType } from 'ajv/dist/core.js';

import { $ID, ARRAY, BOOLEAN, OBJECT, PROPERTIES, SCHEMA, STRING, TYPE } from '../constants/strings.const.js';

/**
 * @summary Defines the structure for a schema document.
 * @description This schema is used to validate other schema definitions. It ensures that any new schema conforms to a standard structure, including properties like ID, type, and security rules.
 */
export const schemaSchema = {
    /**
     * @summary A unique identifier for this schema definition.
     * @description This ID is used to reference the schema within the system. It should be a unique string.
     * @example "my-custom-schema"
     */
    $id: SCHEMA,
    /**
     * @summary Specifies if properties not explicitly defined in the schema are allowed.
     * @description When set to false, any properties in the data that are not defined in the `properties` object will cause validation to fail. This ensures strict adherence to the schema definition.
     */
    additionalProperties: false,
    /**
     * @summary The main container for the schema's properties.
     * @description This object holds all the definitions for the fields that make up the schema being defined.
     */
    properties: {
        /**
         * @summary The unique identifier for the schema being defined.
         * @description A unique string that identifies the schema. It's used for referencing and retrieval.
         * @example "user-profile"
         */
        $id: {
            description: "The unique identifier for the schema being defined. It's used for referencing and retrieval.",
            type: STRING,
        },
        /**
         * @summary Controls whether the schema being defined can accept properties not explicitly listed.
         * @description If false, the data being validated against this schema cannot have extra fields. Defaults to false.
         * @example false
         */
        additionalProperties: {
            default: false,
            description: 'Controls whether the schema being defined can accept properties not explicitly listed. Defaults to false.',
            type: BOOLEAN,
        },
        /**
         * @summary A human-readable description of the schema's purpose.
         * @description This should explain what the schema represents and how it should be used. It is optional.
         * @example "This schema defines the structure for a user's public profile."
         */
        description: {
            description: "A human-readable description of the schema's purpose.",
            nullable: true,
            type: STRING,
        },
        /**
         * @summary Defines the fields or properties of the schema being created.
         * @description This is the core of the schema definition, where each field, its type, and constraints are specified. It must contain at least one property.
         */
        properties: {
            /**
             * @summary Defines the schema for each individual property within the `properties` object.
             * @description This allows for defining metadata for each field, such as its type, description, format, and security rules.
             */
            additionalProperties: {
                properties: {
                    /**
                     * @summary A description of what the individual property represents.
                     * @example "The user's first name."
                     */
                    description: {
                        description: 'A description of what the individual property represents.',
                        type: STRING,
                    },
                    /**
                     * @summary Specifies the data format for the property.
                     * @description Useful for validation of common string formats like dates or emails.
                     * @example "email", "date-time", "uuid"
                     */
                    format: {
                        description: "Specifies the data format for the property, like 'email' or 'date-time'.",
                        type: STRING,
                    },
                    /**
                     * @summary Defines role-based access control for the property.
                     * @description Specifies which roles are required to perform CRUD (Create, Read, Update, Delete) and List operations on this specific property. This is optional.
                     */
                    security: {
                        nullable: true,
                        properties: {
                            /**
                             * @summary Roles required to set the property value upon creation.
                             * @example ["admin", "owner"]
                             */
                            create: {
                                description: 'Roles required to set the property value upon creation.',
                                items: { type: STRING },
                                type: ARRAY,
                            },
                            /**
                             * @summary Roles required to delete the property.
                             * @example ["admin"]
                             */
                            delete: {
                                description: 'Roles required to delete the property.',
                                items: { type: STRING },
                                type: ARRAY,
                            },
                            /**
                             * @summary Roles required to see this property in a list of items.
                             * @example ["admin", "editor", "viewer"]
                             */
                            list: {
                                description: 'Roles required to see this property in a list of items.',
                                items: { type: STRING },
                                type: ARRAY,
                            },
                            /**
                             * @summary Roles required to read the property value.
                             * @example ["admin", "owner", "viewer"]
                             */
                            read: {
                                description: 'Roles required to read the property value.',
                                items: { type: STRING },
                                type: ARRAY,
                            },
                            /**
                             * @summary Roles required to update the property value.
                             * @example ["admin", "owner"]
                             */
                            update: {
                                description: 'Roles required to update the property value.',
                                items: { type: STRING },
                                type: ARRAY,
                            },
                        },
                        type: OBJECT,
                    },
                    /**
                     * @summary The data type of the property.
                     * @description This is a mandatory field that defines the type of data the property holds.
                     * @example "string", "number", "boolean", "object"
                     */
                    type: {
                        description: "The data type of the property (e.g., 'string', 'number').",
                        type: STRING,
                    },
                },
                required: [TYPE],
                type: OBJECT,
            },
            minProperties: 1,
            type: OBJECT,
        },
        /**
         * @summary A list of property names that are mandatory.
         * @description Any property name included in this array must be present in the data being validated. This is optional.
         * @example ["username", "email"]
         */
        required: {
            description: 'A list of property names that are mandatory.',
            items: {
                type: STRING,
            },
            nullable: true,
            type: ARRAY,
        },
        /**
         * @summary Defines top-level, role-based access control for the entire schema.
         * @description These rules apply to the entire data object defined by the schema, as opposed to individual properties. This is optional.
         */
        security: {
            nullable: true,
            properties: {
                /**
                 * @summary Roles required to create a new object of this schema.
                 * @example ["admin", "member"]
                 */
                create: {
                    description: 'Roles required to create a new object of this schema.',
                    items: { type: STRING },
                    type: ARRAY,
                },
                /**
                 * @summary Roles required to delete an object of this schema.
                 * @example ["admin", "owner"]
                 */
                delete: {
                    description: 'Roles required to delete an object of this schema.',
                    items: { type: STRING },
                    type: ARRAY,
                },
                /**
                 * @summary Roles required to list all objects of this schema.
                 * @example ["admin", "auditor"]
                 */
                list: {
                    description: 'Roles required to list all objects of this schema.',
                    items: { type: STRING },
                    type: ARRAY,
                },
                /**
                 * @summary Roles required to read an object of this schema.
                 * @example ["admin", "owner", "viewer"]
                 */
                read: {
                    description: 'Roles required to read an object of this schema.',
                    items: { type: STRING },
                    type: ARRAY,
                },
                /**
                 * @summary Roles required to update an object of this schema.
                 * @example ["admin", "owner"]
                 */
                update: {
                    description: 'Roles required to update an object of this schema.',
                    items: { type: STRING },
                    type: ARRAY,
                },
            },
            type: OBJECT,
        },
        /**
         * @summary The type of the root of the schema being defined.
         * @description This must always be 'object', as this schema is for defining object structures.
         */
        type: {
            description: "The root type of the schema. Must be 'object'.",
            enum: [OBJECT],
            type: STRING,
        },
    },
    /**
     * @summary Specifies the mandatory top-level properties for a valid schema definition.
     * @description A schema definition is not valid unless it includes an `$id`, `type`, and a `properties` object.
     */
    required: [$ID, TYPE, PROPERTIES],
    /**
     * @summary The type for the schema definition itself.
     * @description This must be 'object', as the schema definition is an object.
     */
    type: [OBJECT],
};

export type Schema = JTDDataType<typeof schemaSchema>;
