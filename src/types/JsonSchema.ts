export interface JsonSchema {
    $id?: string;
    type?: string;
    properties?: Record<string, string>;
    description?: string;
    required?: string[];
    additionalProperties?: boolean;
    security?: {
        create?: string[];
        read?: string[];
        update?: string[];
        delete?: string[];
    };
}
