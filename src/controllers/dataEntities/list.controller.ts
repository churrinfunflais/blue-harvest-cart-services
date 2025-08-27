/**
 * @file list.controller.js
 * @description Controller for listing documents from a DB collection.
 * This controller is responsible for building and executing complex queries,
 * handling standard filtering, vector-based similarity searches, pagination,
 * field selection, and caching of results.
 */
import { CollectionReference, DocumentData, Query, Timestamp } from '@google-cloud/firestore';

import { SOMETHING_WENT_WRONG } from '../../constants/errors.const.js';
import { CREATED_AT, DOT_PRODUCT, EMBEDDING, EQUALS, FALSE, NUMBER_0, NUMBER_10, TRUE, UPDATED_AT } from '../../constants/strings.const.js';
import { iError } from '../../types/error.js';
import { cache } from './cache.controller.js';
import { embedQuery } from './embeddings.controller.js';

/**
 * Fetches a list of documents from a DB collection based on a set of query parameters.
 * It can perform either a standard filtered query or a vector-based similarity search.
 * Results are cached to improve performance for repeated queries.
 *
 * @param {CollectionReference} ref - The base DB collection reference to query against.
 * @param {[string, string][]} filters - An array of key-value pairs for `where` clauses.
 * @param {string} [limit] - The maximum number of documents to return. Defaults to '25'.
 * @param {string} [offset] - The number of documents to skip for pagination. Defaults to '0'.
 * @param {string} [query] - A string for vector similarity search. If provided, this triggers a vector search instead of a standard query.
 * @param {boolean} [countTotal] - If true, performs an additional query to get the total count of documents in the collection.
 * @param {string[]} [fields] - An array of field names to select from the documents, reducing payload size.
 * @returns {Promise<{ objectList: DocumentData[]; count?: number }>} A promise that resolves to an object containing the list of documents and an optional total count.
 */
const listController = async (
    ref: CollectionReference,
    filters: [string, string][],
    limit?: string,
    offset?: string,
    query?: string,
    countTotal?: boolean,
    fields?: string[],
    consistentRead = false
): Promise<{ objectList: DocumentData[]; count?: number; cached?: boolean }> => {
    try {
        // --- 1. Parse and Sanitize Input Parameters ---
        const parsedLimit = Math.max(1, Math.min(parseInt(limit || NUMBER_10, 10), 100));
        const parsedOffset = parseInt(offset || NUMBER_0);

        // --- 2. Build the Base DB Query ---
        // Start with a base query and progressively add clauses.
        let baseQuery: Query<DocumentData, DocumentData> = ref.limit(parsedLimit);

        if (offset) baseQuery = baseQuery.offset(parsedOffset);
        // Apply all provided filters as `where` clauses.
        // TODO: aply type coersion from the schema
        if (filters?.length)
            filters
                ?.map(([key, val]) => {
                    let newVal: string | boolean = val;
                    if (newVal === TRUE) newVal = true;
                    if (newVal === FALSE) newVal = false;

                    return [key, newVal];
                })
                ?.forEach(([key, val]) => (baseQuery = baseQuery.where(key as string, EQUALS, val)));
        // If specific fields are requested, apply a `select` clause.
        if (fields?.length) baseQuery = baseQuery.select(...fields, CREATED_AT, UPDATED_AT);

        // --- 3. Determine Final Query Type (Standard vs. Vector Search) ---
        // If a `query` string is provided, perform a vector similarity search.
        // Otherwise, use the standard filtered `baseQuery`.
        const finalQuery = query
            ? ref.findNearest({
                  distanceMeasure: DOT_PRODUCT,
                  limit: parsedLimit,
                  queryVector: await embedQuery(query, ref),
                  vectorField: EMBEDDING,
              })
            : baseQuery;

        // --- 4. Caching Logic ---
        // Create a unique cache key based on all query parameters.
        const cacheKey = `${ref.path}:${parsedLimit}:${parsedOffset}:${filters.join()}:${fields?.join()}:${query}`;
        const cachedData = await cache.get(cacheKey);

        // If valid cached data is found, return it immediately.
        if (cachedData?.length && !consistentRead) return { cached: true, objectList: cachedData as DocumentData[] };

        // --- 5. Execute DB Query ---
        const snapshot = await finalQuery.get();
        // If requested, perform a separate query to get the total count of documents.
        const count = (countTotal && (await ref.count().get()).data()?.count) || undefined;
        // --- 6. Process and Format Results ---
        const snapshotData = snapshot.docs?.map((doc) => ({ objectId: doc.id, ...doc.data() }));
        // Map over the data to convert DB Timestamps to ISO 8601 strings for consistent output.
        const mappedData = snapshotData?.map((i: DocumentData) => ({
            ...i,
            createdAt: (i?.createdAt as Timestamp)?.toDate()?.toISOString(),
            updatedAt: (i?.updatedAt as Timestamp)?.toDate()?.toISOString(),
        }));

        // If results were found, store them in the cache for future requests.
        if (mappedData?.length) await cache.set(cacheKey, mappedData, 300);

        return { count, objectList: mappedData };
    } catch (error) {
        // --- 7. Error Handling ---
        // If it's a known application error, re-throw it.
        if (error instanceof iError) throw error;
        // Otherwise, wrap it in a generic error for a consistent response.
        throw new iError(SOMETHING_WENT_WRONG);
    }
};

export default listController;
