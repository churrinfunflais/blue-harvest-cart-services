import { DocumentData, DocumentReference, Timestamp } from '@google-cloud/firestore';

import { OBJECT_NOT_FOUND, SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { iError } from '../../types/error.js';
import { cache } from './cache.controller.js';

const getController = async (ref: DocumentReference): Promise<{ object: DocumentData; cached?: boolean }> => {
    try {
        const cachedData = await cache.get(ref.path);
        if (cachedData) return { cached: true, object: cachedData };

        const snapshot = await ref.get();

        if (!snapshot.exists) throw new iError(OBJECT_NOT_FOUND, 404);

        const snapshotData = snapshot.data();
        const mappedData = {
            ...snapshotData,
            createdAt: (snapshotData?.createdAt as Timestamp)?.toDate()?.toISOString(),
            objectId: ref.id,
            updatedAt: (snapshotData?.updatedAt as Timestamp)?.toDate()?.toISOString(),
        };

        if (mappedData) await cache.set(ref.path, mappedData);

        return { object: mappedData };
    } catch (error) {
        if (error instanceof iError) throw error;
        throw new iError(SOMETHING_WENT_WRONG);
    }
};
export default getController;
