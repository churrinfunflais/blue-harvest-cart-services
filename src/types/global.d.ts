// In types/global.d.ts
import { iError as iErrorClass } from './iError.ts';

declare global {
    // This tells TypeScript that a global variable named CustomError exists
    // and its type is the same as the CustomError class constructor.
    const iError: typeof iErrorClass;
}

// This empty export makes the file a module.
export {};
