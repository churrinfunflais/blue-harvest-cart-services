import { Router } from 'express';

export const mainRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});
