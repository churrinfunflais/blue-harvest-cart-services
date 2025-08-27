import { Firestore } from '@google-cloud/firestore';
import { NextFunction, Request, Response } from 'express';
import NodeCache from 'node-cache';

import { NODECACHE_TTL, OVERRIDE_DB_INSTANCE, OVERRIDE_WORKSPACE } from '../../config.js';
import { X_WORKSPACE } from '../../constants/headers.const.js';
import { BLUE_HARVEST } from '../../constants/strings.const.js';
import refreshWorkspaceConfigCache from '../../handlers/workspace/refreshWorkspaceConfigCache.handler.js';

export const workspaceCache = new NodeCache({
    checkperiod: 60,
    stdTTL: NODECACHE_TTL,
});

const workspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        req.workspace = OVERRIDE_WORKSPACE || req.hostname;
        req.db = new Firestore({
            databaseId: OVERRIDE_DB_INSTANCE || BLUE_HARVEST,
        });

        await refreshWorkspaceConfigCache(req.db, req.workspace);

        res.set(X_WORKSPACE, req.workspace);

        next();
    } catch (error) {
        next(error);
    }
};

export default workspace;
