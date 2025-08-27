export const FIELDS_DESCRIPTION = (data: string): string =>
    `Specifies a list of fields to include in the response object. Provide multiple fields as a single **comma-separated string**. This allows you to retrieve a partial representation of the resource, reducing the payload size. If this parameter is not provided, the full resource object is returned.  
>**KeyFields:** ${data}`;
export const SEARCH_DESCRIPTION = (data: string): string =>
    `Performs a contextual, free-text search across key fields of the resource. The search matches partial or full words. If multiple terms are provided, objects that match the provided terms will be returned. If this parameter is omitted, no search filter is applied.  
>**KeyFields:** ${data}`;
export const LIMIT_DESCRIPTION = `The maximum number of items to return in the response, min 1, max 100.`;
export const OBJECT_ID_DESCRIPTION = `The unique identifier of the object`;
export const DATA_ENTITY_DESCRIPTION = `The name of the data entity`;
export const SUB_OBJECT_ID_DESCRIPTION = `The unique identifier of the sub object`;
export const OFFSET_DESCRIPTION = `Number of offset objects to skip.`;
export const SORT_DESCRIPTION = ``;
export const CONSISTEN_READ_DESCRIPTION =
    'A boolean parameter to specify whether to perform a strongly consistent read or an eventually consistent read, by default, this endpoint serves data from a high-speed acceleration layer to ensure fast response times. This acceleration layer data has a 5-minute Time-To-Live (TTL), meaning the information you receive could be up to 5 minutes old. This is suitable for most applications where near-real-time data is sufficient';
export const FILTER_DESCRIPTION = (param: string): string => `Filters the objects based on **${param}** criteria`;
export const CREATE_SUMMARY = (entity: string): string => `Create a single object in the ${entity} data entity.`;
export const UPDATE_SUMMARY = (entity: string): string => `Update a single object in the ${entity} data entity.`;
export const DELETE_SUMMARY = (entity: string): string => `Delete a single object in the ${entity} data entity.`;
export const LIST_SUMMARY = (entity: string): string => `List all objects in the ${entity} data entity.`;
export const GET_SUMMARY = (entity: string): string => `Get a single object in the ${entity} data entity.`;
export const EXPRESSION_DESCRIPTION = `Specifies the unique identifier of a pre-configured JSONata expression to be applied to the raw data before the response is returned. This allows clients to request transformed, reshaped, or filtered versions of the data according to predefined business logic or presentation needs, without requiring changes to the core API endpoint logic. The server will look up the JSONata expression associated with the provided ID and use it to process the data.`;

export const LIST_WEBHOOKS = `List all webhooks in a data entity.`;
export const LIST_WEBHOOKS_DESCRIPTION = `List all webhooks in a data entity.`;
export const CREATE_WEBHOOK = `Create a new webhook in a data entity.`;
export const CREATE_WEBHOOK_DESCRIPTION =
    'Creates and registers a new webhook to receive notifications for events related to a specific data entity. The system will send a POST request to the provided `url`';
export const GET_WEBHOOK = `Get a webhook in a data entity.`;
export const GET_WEBHOOK_DESCRIPTION = `Get a webhook in a data entity.`;
export const UPDATE_WEBHOOK = `Update a webhook in a data entity.`;
export const UPDATE_WEBHOOK_DESCRIPTION = `Update a webhook in a data entity.`;
export const DELETE_WEBHOOK = `Delete a webhook in a data entity.`;
export const DELETE_WEBHOOK_DESCRIPTION = `Delete a webhook in a data entity.`;

export const LIST_ACTIONS = `List all actions in a data entity.`;
export const LIST_ACTIONS_DESCRIPTION = `List all actions in a data entity.`;
export const CREATE_ACTION = `Create a new action in a data entity.`;
export const CREATE_ACTION_DESCRIPTION = `Create a new action in a data entity.`;
export const GET_ACTION = `Get an action in a data entity.`;
export const GET_ACTION_DESCRIPTION = `Get an action in a data entity.`;
export const UPDATE_ACTION = `Update an action in a data entity.`;
export const UPDATE_ACTION_DESCRIPTION = `Update an action in a data entity.`;
export const DELETE_ACTION = `Delete an action in a data entity.`;
export const DELETE_ACTION_DESCRIPTION = `Delete an action in a data entity.`;

export const LIST_EXPRESSIONS = `List all expressions in a data entity.`;
export const LIST_EXPRESSIONS_DESCRIPTION = `List all expressions in a data entity.`;
export const CREATE_EXPRESSION = `Create a new expression in a data entity.`;
export const CREATE_EXPRESSION_DESCRIPTION = `Create a new expression in a data entity.`;
export const GET_EXPRESSION = `Get an expression in a data entity.`;
export const GET_EXPRESSION_DESCRIPTION = `Get an expression in a data entity.`;
export const UPDATE_EXPRESSION = `Update an expression in a data entity.`;
export const UPDATE_EXPRESSION_DESCRIPTION = `Update an expression in a data entity.`;
export const DELETE_EXPRESSION = `Delete an expression in a data entity.`;
export const DELETE_EXPRESSION_DESCRIPTION = `Delete an expression in a data entity.`;

export const LIST_SCHEMAS = `List all data entity schemas.`;
export const LIST_SCHEMAS_DESCRIPTION = `List all data entity schemas.`;
export const CREATE_SCHEMA = `Create a new data entity schema.`;
export const CREATE_SCHEMA_DESCRIPTION = `Create a new data entity schema.`;
export const GET_SCHEMA = `Get a data entity schema.`;
export const GET_SCHEMA_DESCRIPTION = `Get a data entity schema.`;
export const UPDATE_SCHEMA = `Update an data entity schema.`;
export const UPDATE_SCHEMA_DESCRIPTION = `Update an data entity schema.`;
export const DELETE_SCHEMA = `Delete an data entity schema.`;
export const DELETE_SCHEMA_DESCRIPTION = `Delete an data entity schema.`;

export const LIST_USERS = `List all users`;
export const LIST_USERS_DESCRIPTION = `Retrieves a paginated list of all users.`;
export const CREATE_USER = `Create a new user`;
export const CREATE_USER_DESCRIPTION = `Creates a new user account with the information provided in the request body. Returns the newly created user object upon success.`;
export const GET_USER = `Get user by email`;
export const GET_USER_DESCRIPTION = `Retrieves the details of a specific user by their unique identifier (ID). Returns a 404 error if the user is not found.`;
export const UPDATE_USER = `Update user by email`;
export const UPDATE_USER_DESCRIPTION = `Updates the details of an existing user specified by their ID. This endpoint supports partial updates; only the fields provided in the request body will be modified. Returns the updated user object.`;

export const OPEN_API_TITLE = (workspace: string): string => `Blue Harvest API: ${workspace}`;
