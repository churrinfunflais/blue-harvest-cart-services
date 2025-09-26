import { env } from 'node:process';

export const PORT = env.PORT || 8080;
export const CORS_ORIGIN = env.CORS_ORIGIN || '*';
export const LOGING_MODE = env.LOGING_MODE || ':date[iso] | :status :method :url :response-time ms | :headers :body';
export const NODECACHE_TTL = (env.NODECACHE_TTL && parseInt(env.NODECACHE_TTL)) || 300; // 5min
export const AWS_REGION = env.AWS_REGION || 'us-east-1';
export const DAX_ENDPOINTS = env.DAX_ENDPOINT?.split(',');
