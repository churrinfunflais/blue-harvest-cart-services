import { randomUUID } from 'node:crypto';

import { GoogleAuth } from 'google-auth-library';
import { google, identitytoolkit_v3 } from 'googleapis';

import { GOOGLE_CLOUD_PROJECT } from '../config.js';
import { User } from '../schemas/user.js';
import { iError } from '../types/error.js';

export const listIdpUsers = async (workspace: string, offset = 0, limit = 500): Promise<User[]> => {
    try {
        const tenantId = await getTenantId(workspace);
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        const response: { data: { userInfo: identitytoolkit_v3.Schema$UserInfo[] } } = await auth.request({
            data: { limit, offset, tenantId },
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com//v1/projects/${GOOGLE_CLOUD_PROJECT}/accounts:query`,
        });

        const users = response?.data?.userInfo?.map((i) => ({
            active: i?.disabled ? false : true,
            displayName: i?.displayName as string,
            email: i?.email as string,
            emailVerified: i?.emailVerified as boolean,
            lastLoginAt: (i.lastLoginAt && new Date(parseInt(i?.lastLoginAt)).toISOString()) || null,
            roles: (i?.customAttributes && ((JSON.parse(i?.customAttributes) as User)?.roles as string[])) || [],
            uid: i?.localId as string,
        }));

        return users || [];
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const getIdpUser = async (email: string, workspace: string): Promise<User | null> => {
    try {
        const tenantId = await getTenantId(workspace);
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        const response: { data: { users: identitytoolkit_v3.Schema$UserInfo[] } } = await auth.request({
            data: { email: [email], tenantId },
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com//v1/projects/${GOOGLE_CLOUD_PROJECT}/accounts:lookup`,
        });

        const user = response?.data?.users
            ?.map((i) => ({
                active: i?.disabled ? false : true,
                displayName: i?.displayName as string,
                email: i?.email as string,
                emailVerified: i?.emailVerified as boolean,
                lastLoginAt: (i.lastLoginAt && new Date(parseInt(i?.lastLoginAt)).toISOString()) || null,
                roles: (i?.customAttributes && ((JSON.parse(i?.customAttributes) as User)?.roles as string[])) || [],
                uid: i?.localId as string,
            }))
            ?.shift();

        return user || null;
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const createIdpUser = async (params: User, workspace: string): Promise<User | null> => {
    try {
        const tenantId = await getTenantId(workspace);
        const existentUser = await getIdpUser(params.email, workspace);

        if (existentUser) return existentUser;

        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        await auth.request({
            data: {
                tenantId,
                users: [
                    {
                        displayName: params.displayName,
                        email: params.email,
                        emailVerified: false,
                        localId: params.uid || randomUUID(),
                        // ...(phone && {
                        //     mfaInfo: [
                        //         {
                        //             phoneInfo: phone,
                        //         },
                        //     ],
                        // }),
                    },
                ],
            },
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com//v1/projects/${GOOGLE_CLOUD_PROJECT}/accounts:batchCreate`,
        });

        const newUser = await getIdpUser(params.email, workspace);

        return newUser;
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const updateIdepUser = async (params: User, workspace: string): Promise<unknown> => {
    try {
        const tenantId = await getTenantId(workspace);
        const existentUser = await getIdpUser(params.email, workspace);

        if (!existentUser) throw new iError('User not found', 404);

        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });

        await auth.request({
            data: {
                customAttributes: JSON.stringify({ roles: existentUser.roles }),
                email: existentUser.email,
                localId: existentUser.uid,
                ...((params.roles && { customAttributes: JSON.stringify({ roles: params.roles }) }) || null),
                ...(params.active !== undefined && { disableUser: !params.active }),
                ...(params.displayName && { displayName: params.displayName }),
                tenantId,
            },
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com//v1/projects/${GOOGLE_CLOUD_PROJECT}/accounts:update`,
        });

        const user = await getIdpUser(params.email, workspace);

        return user;
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const changePasswordPolicy = async (workspace: string): Promise<void> => {
    try {
        const tenantId = await getTenantId(workspace);
        const identitytoolkit = google.identitytoolkit({
            auth: new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            }),
            version: 'v2',
        });

        await identitytoolkit.projects.tenants.patch({
            name: `projects/${GOOGLE_CLOUD_PROJECT}/tenants/${tenantId}`,
            requestBody: {
                passwordPolicyConfig: {
                    forceUpgradeOnSignin: true,
                    passwordPolicyEnforcementState: 'ENFORCE',
                    passwordPolicyVersions: [
                        {
                            customStrengthOptions: {
                                containsLowercaseCharacter: true,
                                containsNonAlphanumericCharacter: true,
                                containsNumericCharacter: true,
                                containsUppercaseCharacter: true,
                                minPasswordLength: 8,
                            },
                        },
                    ],
                },
            },
            updateMask:
                'passwordPolicyConfig.forceUpgradeOnSignin,passwordPolicyConfig.passwordPolicyVersions,passwordPolicyConfig.passwordPolicyEnforcementState',
        });

        const response = await identitytoolkit.projects.tenants.get({
            name: `projects/${GOOGLE_CLOUD_PROJECT}/tenants/${tenantId}`,
        });

        console.log(response.data);
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const getTenantId = async (workspace: string): Promise<string> => {
    try {
        const tenantName = workspace.replaceAll('.styrk.io', '').replaceAll('.bh', '');
        const identitytoolkit = google.identitytoolkit({
            auth: new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            }),
            version: 'v2',
        });
        const response = await identitytoolkit.projects.tenants.list({
            parent: `projects/${GOOGLE_CLOUD_PROJECT}`,
        });

        const tenantId = response.data.tenants
            ?.find((i) => i.displayName === tenantName)
            ?.name?.split('/')
            .pop();

        return tenantId as string;
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const verifyPassword = async (
    opts: identitytoolkit_v3.Params$Resource$Relyingparty$Verifypassword['requestBody'] & { workspace?: string }
): Promise<{ authToken: string; expiresIn: string }> => {
    try {
        const tenantId = await getTenantId(opts.workspace as string);
        const identitytoolkit = google.identitytoolkit({
            auth: new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            }),
            version: 'v3',
        });

        const response = await identitytoolkit.relyingparty.verifyPassword({
            requestBody: { ...opts, tenantId },
        });

        return {
            authToken: response.data.idToken as string,
            expiresIn: response.data.expiresIn as string,
        };
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};

export const activateTenantLoginLogs = async (workspace: string): Promise<void> => {
    try {
        const tenantId = await getTenantId(workspace);
        const identitytoolkit = google.identitytoolkit({
            auth: new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/cloud-platform',
            }),
            version: 'v2',
        });

        await identitytoolkit.projects.tenants.patch({
            name: `projects/${GOOGLE_CLOUD_PROJECT}/tenants/${tenantId}`,
            requestBody: {
                monitoring: {
                    requestLogging: {
                        enabled: true,
                    },
                },
            },
            updateMask: 'monitoring.requestLogging.enabled',
        });

        const response = await identitytoolkit.projects.tenants.get({
            name: `projects/${GOOGLE_CLOUD_PROJECT}/tenants/${tenantId}`,
        });

        console.log(response.data.monitoring);
    } catch (error) {
        console.error(error);
        throw new iError((error as Error)?.message, 500);
    }
};
