/**
 * @file update.controller.js
 * @description Controller for updating an existing document in the DB.
 * This controller handles merging new data with existing data, updating
 * timestamps, re-generating text embeddings for search, and clearing
 * the relevant cache entry.
 */
import { DocumentData, DocumentReference, FieldValue } from '@google-cloud/firestore';

import { SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { COMMA_SPACE } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';
import { cache } from './cache.controller.js';
import { embedDocument } from './embeddings.controller.js';
import getController from './get.controller.js';

/**
 * Updates a specific document in the DB. It fetches the existing document,
 * merges the new data, re-calculates the embedding for searchable fields,
 * and invalidates the cache for the updated document.
 *
 * @param {DocumentData} data - The incoming data object containing fields to be updated.
 * @param {DocumentReference} ref - The DB reference to the specific document to update.
 * @param {string[]} [searchableFields] - An optional array of field names that should be included in the text embedding for similarity search.
 * @returns {Promise<DocumentData>} A promise that resolves with the full, updated document data after the operation.
 */
const updateController = async (
    data: DocumentData,
    ref: DocumentReference,
    searchableFields?: string[],
    user?: { email: string; id: string } | null
): Promise<DocumentData> => {
    try {
        // --- 1. Fetch Existing Document ---
        // Retrieve the current version of the document to merge with the new data.
        const { object } = await getController(ref);
        // --- 2. Prepare Data for Merging ---
        // Remove timestamp fields from both the new and existing data to prevent
        // them from being part of the merged object before the server timestamp is set.
        delete data.updatedAt;
        delete data.createdAt;
        delete data.updatedBy;
        delete data.createdBy;
        delete data.objectId;

        delete object.updatedAt;
        delete object.createdAt;
        delete object.updatedBy;
        delete object.createdBy;
        delete object.objectId;

        // Merge the existing document with the new data, then add a server-side
        // timestamp to mark the update time accurately.
        const mappedData: DocumentData = {
            ...object,
            ...data,
            objectId: ref.id,
            updatedAt: FieldValue.serverTimestamp(),
            updatedBy: user,
        };

        // --- 3. Generate Text for Embedding ---
        // If searchable fields are defined, concatenate their key-value pairs
        // into a single string. This string will be used to generate a new vector embedding.
        const text = Object.entries(mappedData)
            ?.reduce((acc, [key, value]) => {
                if (searchableFields?.includes(key)) acc = [...acc, `${key} ${value}`];
                return acc;
            }, [] as string[])
            ?.join(COMMA_SPACE);

        // --- 4. Execute DB Update ---
        // Update the document in the DB. If a text string was generated, also
        // create and add the new 'embedding' field.
        await ref.update({ ...mappedData, ...(text && { embedding: await embedDocument(text) }) });

        // --- 5. Cache Invalidation ---
        // Delete the old cache entry for this document to ensure subsequent
        // reads will fetch the fresh data.
        await cache.del(ref.path);

        // --- 6. Return Updated Document ---
        // Fetch the document one more time to get the final state, including the
        // server-generated timestamp, and return it.
        const { object: newObject } = await getController(ref);

        return newObject;
    } catch (error) {
        // --- 7. Error Handling ---
        // If it's a known application error, re-throw it.
        if (error instanceof iError) throw error;
        // Otherwise, wrap it in a generic error for a consistent response.
        throw new iError(SOMETHING_WENT_WRONG);
    }
};
export default updateController;
