import { JTDDataType } from 'ajv/dist/core.js';

import { ARRAY, BOOLEAN, DATE_TIME, EMAIL, OBJECT, STRING, USER } from '../constants/strings.const.js';

export const userSchema = {
    $id: USER,
    additionalProperties: false,
    description: 'Schema for configuring a User.',
    properties: {
        active: {
            description: "Indicates if the user's account is currently active and able to log in.",
            examples: [true],
            summary: 'User account status',
            type: BOOLEAN,
        },
        displayName: {
            description: "The user's publicly visible name, which can be their full name or a nickname.",
            examples: ['Jane Doe'],
            summary: 'Public display name',
            type: STRING,
        },
        email: {
            description: "The user's unique email address, used for login and communication.",
            examples: ['jane.doe@example.com'],
            format: EMAIL,
            summary: "User's email address",
            type: STRING,
        },
        emailVerified: {
            description: 'Indicates whether the user has confirmed ownership of their email address.',
            examples: [false],
            summary: 'Email verification status',
            type: BOOLEAN,
        },
        lastLoginAt: {
            default: null,
            description: "The timestamp of the user's last successful login in ISO 8601 format.",
            examples: ['2025-08-04T20:56:34Z'],
            format: DATE_TIME,
            nullable: true,
            summary: 'Last login timestamp',
            type: STRING,
        },
        roles: {
            default: null,
            description: 'A list of roles assigned to the user that determine their permissions within the system.',
            examples: [['admin', 'editor']],
            items: { type: STRING },
            nullable: true,
            summary: 'Assigned user roles',
            type: ARRAY,
        },
        uid: {
            description: 'The unique, system-generated identifier (UUID) for the user.',
            examples: ['a1b2c3d4-e5f6-7890-1234-567890abcdef'],
            summary: 'Unique User ID',
            type: STRING,
        },
    },
    required: [EMAIL],
    type: OBJECT,
} as const;

export type User = JTDDataType<typeof userSchema>;
