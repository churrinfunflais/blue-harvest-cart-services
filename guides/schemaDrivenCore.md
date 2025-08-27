## Schema-Driven Core

The entire platform is built upon a dynamic, schema-driven architecture. Schemas are not just for validation; they are the central configuration that dictates how the API behaves for each data entity. This approach allows for the creation of new, fully-featured API endpoints without a single line of code change.

### How It Works

The magic happens in the `schemaFactory.mdw.ts` middleware, which is one of the first to run for any data entity route. It is responsible for loading all configurations related to an entity and compiling them for use during the request lifecycle.

```mermaid
sequenceDiagram
    participant Client
    participant Router as dataEntities.router.ts
    participant Factory as schemaFactory.mdw.ts
    participant Cache as NodeCache
    participant Firestore

    Client->>Router: GET /api/dataEntities/products
    Router->>Factory: Execute middleware
    Factory->>Cache: Check for cached config for 'workspace/products'
    alt Config is cached
        Cache-->>Factory: Return cached config
    else Config not in cache
        Factory->>Firestore: Get 'products' document
        Firestore-->>Factory: Return entity config
        Factory->>Firestore: Get all documents from 'objectSchemas' sub-collection
        Firestore-->>Factory: Return all schema documents
        Factory->>Firestore: Get all documents from 'expressions' sub-collection
        Firestore-->>Factory: Return all expression documents
        Factory->>Firestore: Get all documents from 'webhooks' sub-collection
        Firestore-->>Factory: Return all webhook documents
        Factory->>Firestore: Get all documents from 'actions' sub-collection
        Firestore-->>Factory: Return all action documents
        Factory->>Cache: Store combined config in cache
    end
    Factory->>Factory: Compile schemas with AJV
    Factory-->>Router: Attach compiled validators to req (req.objectSchema)
```

### Custom Schema Keywords

To make schemas more powerful, we use custom keywords recognized by our AJV validator instance (`src/schemas/keywords.ts`).

* **`objectId: true`**: This marks a property as the unique identifier for documents in the collection. When creating a new object, the value of this field will be used as the Firestore Document ID. This is critical for creating predictable and idempotent `POST` operations. A schema can only have one `objectId`.

* **`searchable: true`**: Any property with this keyword will have its value included in the text that gets converted into a vector embedding by Vertex AI. When a document is created or updated, the values of all `searchable` fields are concatenated into a single string, which is then sent to the AI model. This is the foundation of our semantic search (`?contextSearch`).

* **`filter: true`**: This keyword designates a property as being available for exact-match filtering in `GET` requests. The `listDataEntityObjects.mdw.ts` middleware introspects the schema for these properties and will only build `where` clauses for query parameters that match a field marked as filterable.

**Example Schema Snippet:**
```json
{
  "$id": "product",
  "type": "object",
  "properties": {
    "sku": { "type": "string", "objectId": true },
    "name": { "type": "string", "searchable": true, "filter": true },
    "description": { "type": "string", "searchable": true },
    "brand": { "type": "string", "filter": true }
  },
  "required": ["sku", "name"]
}
```
In this example:
* `POST /api/dataEntities/products` with a body of `{"sku": "ABC-123", ...}` will create a document with the ID `ABC-123`.
* The `name` and `description` fields will be used to generate a vector embedding for semantic search.
* `GET /api/dataEntities/products?name=MyProduct&brand=MyBrand` is a valid query because both `name` and `brand` are marked as filterable. A query like `?description=test` would be ignored.

---
