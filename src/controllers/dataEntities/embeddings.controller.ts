/**
 * @file ai.controller.js
 * @description Controller for handling text embedding using Google's Vertex AI.
 * This file provides functions to generate vector embeddings for both documents
 * (for storage and indexing) and queries (for searching), with built-in
 * caching for query embeddings to optimize performance and reduce costs.
 */
import { textMultilingualEmbedding002, vertexAI } from '@genkit-ai/vertexai';
import { CollectionReference, DocumentReference, FieldValue, VectorValue } from '@google-cloud/firestore';
import { genkit } from 'genkit';

import { EMPTY_STRING, RETRIEVAL_DOCUMENT, RETRIEVAL_QUERY, SEARCH_EMBEDDINGS } from '../../constants/strings.const.js';
import { cache } from './cache.controller.js';

// Initialize the Genkit AI framework with the Vertex AI plugin.
// This configures the embedding models to be used.
const ai = genkit({
    plugins: [vertexAI({ location: 'us-central1' })],
});

/**
 * Generates a vector embedding for a given block of text, optimized for document storage.
 * It sanitizes the text by removing HTML tags before generating the embedding.
 *
 * @param {string} text - The input text content to be embedded.
 * @returns {Promise<VectorValue>} A promise that resolves with the DB-native vector object.
 */
export const embedDocument = async (text: string): Promise<VectorValue> => {
    // Sanitize the input text by stripping any HTML tags to ensure only the
    // core text content is used for embedding.
    const sanitizedText = text.replace(/<[^>]*>/g, '')?.trim();
    // Call the Vertex AI service to generate the embedding.
    const embedding = await ai.embed({
        content: sanitizedText,
        embedder: textMultilingualEmbedding002,
        options: {
            // Specify the task type as 'RETRIEVAL_DOCUMENT' for optimal indexing.
            taskType: RETRIEVAL_DOCUMENT,
        },
    });
    // Extract the raw embedding vector from the response.
    const vector = embedding?.shift()?.embedding || [];
    // Return the vector formatted for storage in the DB.
    return FieldValue.vector(vector);
};

/**
 * Generates a vector embedding for a search query, with a multi-layered caching strategy.
 * It sanitizes the query, checks an in-memory cache, then a DB cache, and finally
 * generates a new embedding if no cached version is found.
 *
 * @param {string} text - The search query text.
 * @param {CollectionReference} ref - The DB collection reference where the search is being performed.
 * Used to derive the path for the cache.
 * @returns {Promise<VectorValue>} A promise that resolves with the DB-native vector object for the query.
 */
export const embedQuery = async (text: string, ref: CollectionReference): Promise<VectorValue> => {
    // Sanitize the query text for consistency in caching and embedding.
    const sanitizedText = text
        ?.replace(/<[^>]*>/g, EMPTY_STRING)
        ?.toLowerCase()
        ?.trim();

    // --- 1. In-Memory Cache Check ---
    // First, check the fast in-memory cache for an existing embedding.
    const cacheRef = (ref.parent as DocumentReference).collection(SEARCH_EMBEDDINGS).doc(sanitizedText);
    const cacheData = await cache.get(cacheRef.path);

    if (cacheData?.embedding) return FieldValue.vector(cacheData.embedding as number[]);

    // --- 2. DB Cache Check ---
    // If not in memory, check the persistent cache in the DB.
    const embeddingCacheSnapshot = await cacheRef.get();

    if (embeddingCacheSnapshot.exists) {
        const embedding = embeddingCacheSnapshot.data()?.embedding as VectorValue;
        // If found in DB, store it in the in-memory cache for future requests.
        await cache.set(cacheRef.path, { embedding: embedding.toArray() });
        return embedding;
    }

    // --- 3. Generate New Embedding ---
    // If the embedding is not found in any cache, generate a new one.
    const embedding = await ai.embed({
        content: sanitizedText,
        embedder: textMultilingualEmbedding002,
        options: {
            // Specify the task type as 'RETRIEVAL_QUERY' for optimal search performance.
            taskType: RETRIEVAL_QUERY,
        },
    });

    // --- 4. Populate Caches ---
    // Store the newly generated embedding in both the DB cache and the in-memory cache.
    const vector = embedding?.shift()?.embedding || [];
    await cacheRef.set({ embedding: FieldValue.vector(vector) });
    await cache.set(cacheRef.path, { embedding: vector });
    // Return the new vector formatted for use in a DB query.
    return FieldValue.vector(vector);
};
