/**
 * @file This module configures and exports a DynamoDB DocumentClient.
 * It's designed to seamlessly integrate with DynamoDB Accelerator (DAX) if DAX endpoints are provided in the configuration.
 * If DAX endpoints are not available, it gracefully falls back to a standard DynamoDB DocumentClient.
 * This allows the application to leverage DAX for performance improvements without requiring code changes
 * in other parts of the service.
 */

import { env } from 'node:process';

import AmazonDaxClient from 'amazon-dax-client';
import AWS from 'aws-sdk';

import { AWS_REGION, DAX_ENDPOINTS } from '../config.js';

/**
 * Updates the global AWS configuration.
 * It sets the AWS region from the application's config.
 * Additionally, it checks for AWS credentials in the environment variables.
 * This is a standard practice for applications running in AWS environments (like EC2, ECS, or Lambda),
 * where credentials are automatically supplied via the environment.
 */
AWS.config.update({
    region: AWS_REGION,
    ...(env.AWS_ACCESS_KEY_ID &&
        env.AWS_SECRET_ACCESS_KEY &&
        env.AWS_SESSION_TOKEN && {
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
                sessionToken: env.AWS_SESSION_TOKEN,
            },
        }),
});

// A standard DynamoDB DocumentClient instance used as a fallback when DAX is not configured.
const ddbClient = new AWS.DynamoDB.DocumentClient();

let daxClient: AWS.DynamoDB.DocumentClient | null = null;

// Conditionally create a DAX-enabled DocumentClient if DAX endpoints are provided.
if (DAX_ENDPOINTS?.length) {
    /**
     * The AmazonDaxClient instance.
     * We perform a type assertion (`as unknown as AWS.DynamoDB`) because the `amazon-dax-client`
     * library's type definitions may not perfectly align with the AWS SDK's expected types for
     * the 'service' property of the DocumentClient constructor. This tells TypeScript to
     * treat the DAX client as a compatible service.
     */
    const dax = new AmazonDaxClient({ endpoints: DAX_ENDPOINTS, region: AWS_REGION }) as unknown as AWS.DynamoDB;

    // Wrap the DAX client with a DocumentClient interface.
    daxClient = new AWS.DynamoDB.DocumentClient({ service: dax });
}

/**
 * The exported client that the application will use for all DynamoDB operations.
 * It uses the DAX-enabled client if it was successfully initialized; otherwise,
 * it falls back to the standard DynamoDB client. This ensures the application
 * always has a valid client to work with.
 */
export const documentClient = daxClient ?? ddbClient;
