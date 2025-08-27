import { DocumentData, DocumentReference, FieldValue } from '@google-cloud/firestore';

import { OBJECT_ALREADY_EXISTS, SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { COMMA_SPACE } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';
import { embedDocument } from './embeddings.controller.js';
import getController from './get.controller.js';

const createController = async (
    data: DocumentData,
    ref: DocumentReference,
    searchableFields?: string[],
    user?: { email: string; id: string } | null
): Promise<DocumentData> => {
    try {
        delete data.updatedAt;
        delete data.createdAt;
        delete data.updatedBy;
        delete data.createdBy;

        const text = Object.entries(data)
            ?.reduce((acc, [key, value]) => {
                if (searchableFields?.includes(key)) acc = [...acc, `${key} ${value}`];
                return acc;
            }, [] as string[])
            ?.join(COMMA_SPACE);

        const documentData: DocumentData = {
            ...data,
            ...(text && { embedding: await embedDocument(text) }),
            createdAt: FieldValue.serverTimestamp(),
            createdBy: user,
            objectId: ref.id,
        };

        const { exists } = await ref.get();
        if (exists) throw new iError(OBJECT_ALREADY_EXISTS);

        await ref.set(documentData);
        const { object } = await getController(ref);
        return object;
    } catch (error) {
        if (error instanceof iError) throw error;
        throw new iError(SOMETHING_WENT_WRONG);
    }
};
export default createController;
