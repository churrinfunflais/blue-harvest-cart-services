import { env } from 'node:process';

export const PORT = env.PORT || 8080;
export const CORS_ORIGIN = env.CORS_ORIGIN || '*';
export const LOGING_MODE = env.LOGING_MODE || ':date[iso] | :status :method :url :response-time ms | :headers :body';
export const OVERRIDE_WORKSPACE = env.OVERRIDE_WORKSPACE || '';
export const OVERRIDE_DB_INSTANCE = env.OVERRIDE_DB_INSTANCE || '';
export const WEBHOOKS_TOPIC = env.WEBHOOKS_TOPIC || '';
export const NODECACHE_TTL = (env.NODECACHE_TTL && parseInt(env.NODECACHE_TTL)) || 300; // 5min
export const MEMCACHE_TTL = (env.MEMCACHE_TTL && parseInt(env.MEMCACHE_TTL)) || 172800; // 48hr
export const MEMCACHE_IP = env.MEMCACHE_IP || '127.0.0.1:11211'; // Localhost... in terminal run: memcached
export const SECRET_KEY = env.SECRET_KEY || '';
export const IDP_API_KEY = env.IDP_API_KEY || '';
export const GOOGLE_CLOUD_PROJECT = env.GOOGLE_CLOUD_PROJECT || '';
