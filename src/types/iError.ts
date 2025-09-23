export class iError extends Error {
    public readonly statusCode?: number;
    public readonly details?: unknown;

    constructor(data: string | { message?: string; statusCode?: number; details?: unknown }) {
        if (typeof data == 'object' && data !== null) {
            super(data.message);

            this.statusCode = data.statusCode || 500;

            Object.assign(this, data);
        } else {
            super(data);

            this.statusCode = 500;
        }

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.name = 'iError';
    }
}
