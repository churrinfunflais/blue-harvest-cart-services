import { JTDDataType } from 'ajv/dist/core.js';

import { CREATE, DELETE, NAME, OBJECT, STRING, UPDATE, URI, URL, WEBHOOK } from '../constants/strings.const.js';

/**
 * @summary Defines the structure for configuring a webhook.
 * @description This schema validates the data for creating or updating a webhook. It specifies the endpoint URL, the triggering event, a human-readable name, and other configuration details.
 * @example
 * {
 * "name": "New User Slack Notification",
 * "url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
 * "triggerType": "create",
 * "description": "Notifies the #dev-ops channel in Slack when a new user signs up.",
 * "headers": {
 * "Content-Type": "application/json"
 * }
 * }
 */
export const webhookSchema = {
    /**
     * @summary A unique identifier for this schema definition.
     * @description This ID is used to reference the webhook schema within the system.
     */
    $id: WEBHOOK,
    /**
     * @summary Specifies if properties not explicitly defined in the schema are allowed.
     * @description When set to false, any properties in the data that are not defined in the `properties` object will cause validation to fail.
     */
    additionalProperties: false,
    /**
     * @summary The main container for the webhook's properties.
     * @description This object holds all the definitions for the fields that make up a webhook configuration.
     */
    properties: {
        /**
         * @summary A detailed explanation of the webhook's purpose.
         * @description This optional field allows users to add a note about what the webhook is for, making it easier to manage multiple webhooks.
         * @example "Notifies the #billing channel when a subscription is cancelled."
         */
        description: {
            description: "A detailed explanation of the webhook's purpose and what it's used for.",
            type: STRING,
        },
        /**
         * @summary Custom HTTP headers to be sent with the webhook payload.
         * @description A key-value map of custom headers. This can be used for authentication (e.g., `Authorization: Bearer ...`) or for providing other metadata.
         * @example { "Authorization": "Bearer your-secret-token", "X-Custom-Header": "custom-value" }
         */
        headers: {
            additionalProperties: {
                type: 'string',
            },
            description: 'A key-value map of custom HTTP headers to be sent with the payload.',
            type: OBJECT,
        },
        /**
         * @summary Unique identifier for the webhook.
         * @description A system-generated unique identifier (like a UUID) for the webhook. It's typically not provided on creation but is returned by the system.
         * @example "wh_a1b2c3d4e5"
         */
        id: {
            description: 'A unique, system-generated identifier for the webhook.',
            type: STRING,
        },
        /**
         * @summary A human-readable name for the webhook.
         * @description A required, user-friendly name to easily identify the webhook in a list or UI.
         * @example "Stripe Payment Failure Hook"
         */
        name: {
            description: 'A human-readable name for the webhook to easily identify it.',
            type: STRING,
        },
        /**
         * @summary The event that triggers the webhook.
         * @description Specifies which action (create, update, or delete) on a resource will trigger the webhook to send its payload. Defaults to 'create'.
         * @example "delete"
         */
        triggerType: {
            default: CREATE,
            description: 'The specific event that will trigger the webhook to send a payload.',
            enum: [CREATE, UPDATE, DELETE],
            type: STRING,
        },
        /**
         * @summary The endpoint URL for the webhook payload.
         * @description The required URL where the webhook's HTTP POST request will be sent. It must be a valid URI.
         * @example "https://api.myapp.com/v1/webhooks/stripe"
         */
        url: {
            description: 'The endpoint URL where the webhook payload will be sent via an HTTP POST request.',
            format: URI,
            type: STRING,
        },
    },
    /**
     * @summary Specifies the mandatory properties for a webhook.
     * @description A webhook definition is not valid unless it includes a `url` and a `name`.
     */
    required: [URL, NAME],
    /**
     * @summary The root type of the webhook schema.
     * @description Must be 'object' as the webhook definition is an object.
     */
    type: OBJECT,
};

export type Webhook = JTDDataType<typeof webhookSchema>;
