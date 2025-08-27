import { DocumentReference } from '@google-cloud/firestore';

import { SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { iError } from '../../types/error.js';
import { cache } from './cache.controller.js';
import getController from './get.controller.js';

const deleteController = async (ref: DocumentReference): Promise<void> => {
    try {
        await getController(ref);
        await ref.delete();
        await cache.del(ref.path);

        return;
    } catch (error) {
        if (error instanceof iError) throw error;
        throw new iError(SOMETHING_WENT_WRONG);
    }
};
export default deleteController;
