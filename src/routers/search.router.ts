import { Router } from 'express';

import { ROOT } from '../constants/paths.const.js';
import textSearch from '../middlewares/search/search.mdw.js';

export const searchRouter = Router({
    caseSensitive: true,
    mergeParams: true,
    strict: true,
});

searchRouter.get(ROOT, textSearch);
