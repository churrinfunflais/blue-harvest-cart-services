import crypto from 'node:crypto';

import { SECRET_KEY } from '../config.js';

const algorithm = 'aes-256-cbc';
const key = crypto.pbkdf2Sync(SECRET_KEY, 'sd4w575', 10000, 32, 'sha512');
const iv = crypto.pbkdf2Sync(SECRET_KEY, 'sd4w57', 10000, 16, 'sha512');

export const encrypt = (message: string): string => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    return (encrypted += cipher.final('hex'));
};

export const decrypt = (ciphertext: string): string => {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    return (decrypted += decipher.final('utf8'));
};
