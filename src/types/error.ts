import { ErrorObject } from 'ajv/dist/core.js';

export class iError extends Error {
    public data?: object;
    public statusCode?: number;

    constructor(messageOrData: string | object | ErrorObject | ErrorObject[], statusCode = 500, options?: ErrorOptions) {
        let message: string;
        let data: object | undefined;

        if (typeof messageOrData === 'string') {
            message = messageOrData;
        } else if (typeof messageOrData === 'object' && messageOrData !== null) {
            data = messageOrData;
            const messageFromObject = (data as { message?: string | object }).message;

            if (typeof messageFromObject === 'string') {
                message = messageFromObject;
            } else {
                message = 'Something went wrong! ';
            }
        } else {
            message = String(messageOrData);
        }

        super(message, options);
        this.name = 'Error';

        if (statusCode !== undefined) {
            this.statusCode = statusCode;
        }

        if (data) {
            this.data = data;
        }

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    override toString(): string {
        let output = `${this.name}`;
        if (this.statusCode !== undefined) {
            output += ` [${this.statusCode}]`;
        }
        output += `: ${this.message}`;

        if (this.data) {
            try {
                output += `\nData: ${JSON.stringify(this.data, null, 2)}`;
            } catch (e) {
                output += `\nData: [Could not stringify data: ${e as string}]`;
            }
        }
        return output;
    }
}
