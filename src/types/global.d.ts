// In types/global.d.ts
import { iError as iErrorClass } from './iError.ts';

declare global {
    const iError: typeof iErrorClass;
}

export {};
