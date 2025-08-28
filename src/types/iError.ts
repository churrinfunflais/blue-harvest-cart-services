export class iError extends Error {
    /**
     * The HTTP status code associated with this error.
     */
    public readonly statusCode?: number;
    public readonly details?: unknown;

    /**
     * Creates a structured, type-safe error instance.
     * @param data A string message or a CustomErrorObject for more detailed errors.
     */
    constructor(data: string | { message?: string; statusCode?: number; details?: unknown }) {
        // Check if data is an object using a type guard
        if (typeof data == 'object' && data !== null) {
            // If it's an object, call the parent constructor with its message
            super(data.message);

            // Assign the status code, defaulting to 500
            this.statusCode = data.statusCode || 500;

            // Copy any other properties from the data object to this instance
            Object.assign(this, data);
        } else {
            // If data is a string, call the parent constructor with it
            super(data);

            // Assign a default status code for simple string errors
            this.statusCode = 500;
        }

        // Maintains proper stack trace for where our error was thrown (v8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        // Set the error name to the class name
        this.name = 'iError';
    }
}
