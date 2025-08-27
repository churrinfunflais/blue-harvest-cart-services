import { DocumentData } from '@google-cloud/firestore';
import memjs from 'memjs';

import { MEMCACHE_IP, MEMCACHE_TTL } from '../../config.js';

const client = memjs.Client.create(MEMCACHE_IP, {
    conntimeout: 0.1,
    keepAlive: true,
});

export const cache = {
    del: async (key: string): Promise<void> => {
        try {
            await client.delete(key);
        } catch (error) {
            console.error(error);
            return;
        }
    },
    flush: async (): Promise<void> => {
        try {
            await client.flush();
        } catch (error) {
            console.error(error);
            return;
        }
    },
    get: async (key: string): Promise<DocumentData | null> => {
        try {
            const cachedData = await client.get(key);
            if (!cachedData.value) return null;
            return JSON.parse(cachedData.value.toString()) as DocumentData;
        } catch (error) {
            console.error(error);
            return null;
        }
    },
    set: async (key: string, value: DocumentData, ttl?: number): Promise<void> => {
        try {
            await client.set(key, JSON.stringify(value), { expires: ttl || MEMCACHE_TTL });
        } catch (error) {
            console.error(error);
            return;
        }
    },
};
