import { Firestore } from '@google-cloud/firestore';

//TODO: implement workspace cache
const refreshWorkspaceConfigCache = async (_db: Firestore, _workspace: string, _force = false): Promise<void> => {
    // if (!force && workspaceCache.has(`${workspace}/${CONFIG}`)) return;
    // const workspaceSnapshot = await db.collection(workspace).get();
    // const workspaceDataEntities = workspaceSnapshot.docs?.map((i) => i.id);
    // await Promise.all(workspaceDataEntities.map((i) => refreshDataEntityCache(db, workspace, i, force)));
    // const entitiesWithRoles = config?.filter((i) =>
    //     (i as { objectSchemas: { security: { read: string[] } }[] })?.objectSchemas?.filter((j) => j?.security?.read?.length > 0)
    // );
    // console.log(entitiesWithRoles);
};

export default refreshWorkspaceConfigCache;
