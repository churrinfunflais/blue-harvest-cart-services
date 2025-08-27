import { Firestore } from '@google-cloud/firestore';

import { ENTITY_NOT_FOUND } from '../../constants/errors.const.js';
import { ACTIONS, EXPRESSIONS, OBJECT_SCHEMAS, ROLES, WEBHOOKS } from '../../constants/strings.const.js';
import { workspaceCache } from '../../middlewares/workspace/workspace.mdw.js';
import { iError } from '../../types/error.js';

const refreshDataEntityCache = async (db: Firestore, workspace: string, dataEntity: string, force = false): Promise<object | void> => {
    if (!force && workspaceCache.has(`${workspace}/${dataEntity}`)) return;

    const entitySnapshot = await db.collection(workspace).doc(dataEntity).get();

    if (!entitySnapshot.exists) throw new iError(ENTITY_NOT_FOUND);

    const [objectSchemasSnapshot, expressionsSnapshot, webhooksSnapshot, actionsSnapshot, rolesSnapshot] = await Promise.all([
        db.collection(workspace).doc(dataEntity).collection(OBJECT_SCHEMAS).get(),
        db.collection(workspace).doc(dataEntity).collection(EXPRESSIONS).get(),
        db.collection(workspace).doc(dataEntity).collection(WEBHOOKS).get(),
        db.collection(workspace).doc(dataEntity).collection(ACTIONS).get(),
        db.collection(workspace).doc(dataEntity).collection(ROLES).get(),
    ]);

    const config = entitySnapshot.data();
    const objectSchemas = objectSchemasSnapshot.docs.map((i) => i.data());
    const expressions = expressionsSnapshot.docs.map((i) => i.data());
    const webhooks = webhooksSnapshot.docs.map((i) => i.data());
    const acctions = actionsSnapshot.docs.map((i) => i.data());
    const roles = rolesSnapshot.docs.map((i) => i.data());

    workspaceCache.set(`${workspace}/${dataEntity}`, { acctions, config, expressions, objectSchemas, roles, webhooks });

    return { acctions, config, expressions, objectSchemas, roles, webhooks };
};

export default refreshDataEntityCache;
