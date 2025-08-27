export const ENTITY_NOT_FOUND = 'Entity not found';
export const SCHEMA_NOT_FOUND = 'Schema not found';
export const EXPRESSION_NOT_FOUND = 'Expression not found';
export const OBJECT_NOT_FOUND = 'Object not found';

export const MISSING_DB_OBJECT = 'Missing db object';
export const MISSING_WORKSPACE = 'Missing workspace';
export const MISSING_SCHEMA = 'Missing schema';
export const MISSING_BODY = 'Missing body';
export const MISSING_EXPRESSION = 'Missing expression';
export const MISSING_EXPRESSION_ID = 'Missing expression id';
export const EXPRESSION_IS_NOT_VALID = 'Expression is not valid';
export const MISSING_SCHEMA_ID = 'Missing schema id';
export const MISSING_DATA_ENTITY = 'Missing dataEntity';
export const MISSING_SUB_DATA_ENTITY = 'Missing subDataEntity';
export const MISSING_SUB_OBJECT_ID = 'Missing subObjectId';
export const MISSING_ID = 'Missing id';
export const MISSING_OBJECT_ID = 'Missing objectId';
export const MISSING_DATA_TO_TRANSFORM = 'Missing data to transform';
export const MISSING_WEBHOOK = 'Missing webhook';
export const MISSING_ACTION = 'Missing action';
export const MISSING_ACTION_ID = 'Missing action id';
export const MISSING_WEBHOOK_ID = 'Missing webhook id';
export const WEBHOOK_IS_NOT_VALID = 'Webhook is not valid';
export const WEBHOOK_NOT_FOUND = 'Webhook not found';
export const ACTION_NOT_FOUND = 'Action not found';
export const INVALID_SCHEMA = 'Invalid schema';
export const ROLES_NOT_ALLOWED = (roles: string[]): string => `The following security roles are not allowed: ${roles.join(', ')}`;
export const INVALID_SCHEMA_ID = 'Invalid schema id';
export const MISSING_DATA = 'Missing data';
export const INVALID_DATA = 'Invalid data';
export const SOMETHING_WENT_WRONG = 'Something went wrong';
export const TOO_MANY_FILTERS = 'Too many filters';
export const TOO_MANY_SEARCHABLE_PARAMS = 'Too many searchable params';
export const TOO_MANY_UNIQUE_PARAMS = 'Too many unique params';
export const OBJECT_ID_PARAM_AS_REQUIRED = 'objectId param is not set as required';
export const OBJECT_ALREADY_EXISTS = 'Object already exists';
export const OBJECT_ID_MISMATCH =
    'objectId mismatch. The ID in the URL parameters does not match the id in the request body. Please ensure both values are identical.';
export const SCHEMA_ID_MISMATCH =
    'schemaId mismatch. The id in the URL parameters does not match the id in the request body. Please ensure both values are identical.';

export const INTERNAL_SERVER_ERROR = 'Internal server error';
export const BAD_REQUEST = 'Bad request';
export const NOT_FOUND = 'Not found';
export const UNAUTHORIZED = 'Unauthorized';
export const FORBIDDEN = 'Forbidden';
export const CONFLICT = 'Conflict';

export const INVALID_CREDENTIALS = 'Invalid credentials';
export const INVALID_TOKEN = 'Invalid token';
