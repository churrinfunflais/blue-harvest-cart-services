import { JTDDataType } from 'ajv/dist/core.js';

import { ACTION, NAME, NUMBER, OBJECT, STRING, URI, URL } from '../constants/strings.const.js';

/**
 * @summary Defines the structure for a configurable action.
 * @description This schema is used to validate an 'action', which typically represents an HTTP request to an external service. It includes the target URL, custom headers, and a timeout period.
 * @example
 * {
 * "name": "Process User Feedback",
 * "url": "https://api.sentiment-provider.com/v2/analyze",
 * "description": "Calls the sentiment analysis API to process user feedback.",
 * "timeout": 2000,
 * "headers": {
 * "X-API-Key": "your-secret-api-key",
 * "Content-Type": "application/json"
 * }
 * }
 */
export const actionSchema = {
    /**
     * @summary A unique identifier for this schema definition.
     * @description This ID is used to reference the action schema within the system.
     */
    $id: ACTION,
    /**
     * @summary Specifies if properties not explicitly defined in the schema are allowed.
     * @description When set to false, any properties in the data that are not defined in the `properties` object will cause validation to fail, ensuring strict adherence to the schema.
     */
    properties: {
        /**
         * @summary A detailed explanation of the action's purpose.
         * @description This optional field allows users to add a note about what the action does, making it easier to manage.
         * @example "Calls the sentiment analysis API to process user feedback."
         */
        description: {
            description: "A detailed explanation of the action's purpose and what it's used for.",
            type: STRING,
        },
        /**
         * @summary Custom HTTP headers to be sent with the action's request.
         * @description A key-value map of custom headers. This can be used for authentication (e.g., `Authorization`) or for specifying content types.
         * @example { "X-API-Key": "your-secret-api-key", "Accept": "application/json" }
         */
        headers: {
            additionalProperties: {
                type: 'string',
            },
            description: 'A key-value map of custom HTTP headers to be sent with the request.',
            type: OBJECT,
        },
        /**
         * @summary Unique identifier for the action.
         * @description A system-generated unique identifier for the action, typically not provided on creation but returned by the system.
         * @example "act_1a2b3c4d5e"
         */
        id: {
            description: 'A unique, system-generated identifier for the action.',
            type: STRING,
        },
        /**
         * @summary A human-readable name for the action.
         * @description A required, user-friendly name to easily identify the action in a list or UI.
         * @example "Send to Analytics"
         */
        name: {
            description: 'A human-readable name for the action to easily identify it.',
            type: STRING,
        },
        /**
         * @summary Request timeout in milliseconds.
         * @description The maximum time in milliseconds to wait for a response from the URL before the action fails. Defaults to 500ms.
         * @example 1500
         */
        timeout: {
            default: 500,
            description: 'The maximum time in milliseconds to wait for a response before the action fails.',
            type: NUMBER,
        },
        /**
         * @summary The endpoint URL for the action.
         * @description The required URL to which the action will send its HTTP request. It must be a valid URI.
         * @example "https://api.third-party.com/v1/process"
         */
        url: {
            description: 'The endpoint URL where the action will send an HTTP request.',
            format: URI,
            type: STRING,
        },
    },

    /**
     * @summary Specifies the mandatory properties for an action.
     * @description An action definition is not valid unless it includes a `url` and a `name`.
     */
    required: [URL, NAME],
    /**
     * @summary The root type of the action schema.
     * @description Must be 'object' as the action definition is an object.
     */
    type: OBJECT,
};

export type Action = JTDDataType<typeof actionSchema>;
