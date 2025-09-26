/**
 * @file Provides a fluent, chainable API for interacting with a specific DynamoDB table.
 * This module exports a `DynamoDBTable` class that acts as a factory for creating
 * isolated, chainable builders for various DynamoDB operations like `get` and `put`.
 * This design pattern ensures that concurrent requests do not interfere with each other,
 * promoting safe and readable data access logic.
 */

import type AWS from 'aws-sdk';

/**
 * A manager class for interacting with a specific DynamoDB table. It provides
 * factory methods to create builders for various DynamoDB operations, ensuring
 * that parameters for different requests are never mixed.
 *
 * @example
 * // 1. Initialize the manager for a specific table
 * const usersTable = new DynamoDBTable(dynamoDBDocumentClient, 'users-table');
 *
 * // 2. Build and await a GetItem request directly
 * const user = await usersTable.get<User>()
 * .key({ userId: '123' })
 * .project(['username', 'email']);
 *
 * // 3. Build and await a PutItem request directly
 * await usersTable.insert<User>()
 * .item({ userId: '456', username: 'sandra' })
 * .condition('attribute_not_exists(userId)'); // Optional: prevent overwrites
 */
export class DocumentController {
    private readonly ddbClient: AWS.DynamoDB.DocumentClient;
    private readonly tableName: string;

    /**
     * @param client The configured DynamoDB.DocumentClient instance (standard or DAX-enabled).
     * @param tableName The name of the DynamoDB table to interact with.
     */
    constructor(client: AWS.DynamoDB.DocumentClient, tableName: string) {
        this.ddbClient = client;
        this.tableName = tableName;
    }

    /**
     * Creates a new, isolated builder for a GetItem operation.
     * @returns A `DynamoDBGetter` instance for building a get request.
     */
    public get<T>(): DynamoDBGetter<T> {
        return new DynamoDBGetter<T>(this.ddbClient, this.tableName);
    }

    /**
     * Creates a new, isolated builder for a PutItem operation.
     * @returns A `DynamoDBInserter` instance for building a put request.
     */
    public insert<T extends AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap>(): DynamoDBInserter<T> {
        return new DynamoDBInserter<T>(this.ddbClient, this.tableName);
    }
}

/**
 * An abstract base class for DynamoDB operation builders. It centralizes
 * the AWS client, parameter object handling, and makes builder instances "thenable",
 * allowing them to be awaited directly.
 */
abstract class DynamoDBOperationBuilder<ParamsType extends { TableName: string }, ExecuteReturnType> {
    protected readonly params: ParamsType;
    protected readonly ddbClient: AWS.DynamoDB.DocumentClient;

    constructor(client: AWS.DynamoDB.DocumentClient, initialParams: ParamsType) {
        this.ddbClient = client;
        this.params = initialParams;
    }

    /**
     * Executes the configured DynamoDB request. Can be called explicitly if needed.
     */
    public abstract execute(): Promise<ExecuteReturnType>;

    /**
     * Allows the builder instance to be awaited directly.
     * This method is called by the JavaScript runtime when `await` is used on an instance.
     * @param onfulfilled The callback to execute when the promise is resolved.
     * @param onrejected The callback to execute when the promise is rejected.
     */
    public then<TResult1 = ExecuteReturnType, TResult2 = never>(
        onfulfilled?: ((value: ExecuteReturnType) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: Record<string, unknown>) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        return this.execute().then(onfulfilled, onrejected);
    }
}

/**
 * Builds and executes a GetItem request using a chainable interface.
 */
class DynamoDBGetter<T> extends DynamoDBOperationBuilder<AWS.DynamoDB.DocumentClient.GetItemInput, T | undefined> {
    constructor(client: AWS.DynamoDB.DocumentClient, tableName: string) {
        super(client, {
            Key: {},
            TableName: tableName,
        });
    }

    /**
     * Sets the primary key of the item to retrieve.
     * @param key An object representing the composite primary key of the item.
     * @returns The current `DynamoDBGetter` instance for method chaining.
     */
    public key(key: AWS.DynamoDB.DocumentClient.Key): this {
        this.params.Key = key;
        return this;
    }

    /**
     * Sets the list of attributes to be returned in the result.
     * @param attributes An array of attribute names to retrieve.
     * @returns The current `DynamoDBGetter` instance for method chaining.
     */
    public project(attributes: string[]): this {
        this.params.ProjectionExpression = attributes.join(', ');
        return this;
    }

    /**
     * Specifies the read consistency model.
     * @param isConsistent If true, a strongly consistent read is performed. Defaults to `true`.
     * @returns The current `DynamoDBGetter` instance for method chaining.
     */
    public consistentRead(isConsistent = true): this {
        this.params.ConsistentRead = isConsistent;
        return this;
    }

    /**
     * Executes the configured GetItem request against DynamoDB.
     * @returns A promise that resolves to the retrieved item, or `undefined` if not found.
     * @throws Will throw an `Error` if the primary key has not been set.
     */
    public async execute(): Promise<T | undefined> {
        if (Object.keys(this.params.Key).length === 0) {
            throw new Error('A Key must be provided for the GetItem operation. Use the .key() method.');
        }

        const result = await this.ddbClient.get(this.params).promise();
        return result.Item as T | undefined;
    }
}

/**
 * Builds and executes a PutItem request using a chainable interface.
 */
class DynamoDBInserter<T extends AWS.DynamoDB.DocumentClient.PutItemInputAttributeMap> extends DynamoDBOperationBuilder<
    AWS.DynamoDB.DocumentClient.PutItemInput,
    AWS.DynamoDB.DocumentClient.PutItemOutput
> {
    constructor(client: AWS.DynamoDB.DocumentClient, tableName: string) {
        super(client, {
            Item: {} as T,
            TableName: tableName,
        });
    }

    /**
     * Sets the item data to be created or fully replaced.
     * @param item An object representing the complete item to be written.
     * @returns The current `DynamoDBInserter` instance for method chaining.
     */
    public item(item: T): this {
        this.params.Item = item;
        return this;
    }

    /**
     * Applies a condition that must be met for the write operation to succeed.
     * @param expression A DynamoDB condition expression string.
     * @returns The current `DynamoDBInserter` instance for method chaining.
     */
    public condition(expression: string): this {
        this.params.ConditionExpression = expression;
        return this;
    }

    /**
     * Specifies what values should be returned from the operation.
     * @param values Determines which values to return. `NONE` (default) or `ALL_OLD`.
     * @returns The current `DynamoDBInserter` instance for method chaining.
     */
    public returnValues(values: AWS.DynamoDB.DocumentClient.ReturnValue): this {
        this.params.ReturnValues = values;
        return this;
    }

    /**
     * Executes the configured PutItem request against DynamoDB.
     * @returns A promise that resolves to the output of the put operation.
     * @throws Will throw an `Error` if the item data has not been set.
     */
    public async execute(): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> {
        if (Object.keys(this.params.Item).length === 0) {
            throw new Error('An Item must be provided for the PutItem operation. Use the .item() method.');
        }

        return this.ddbClient.put(this.params).promise();
    }
}
