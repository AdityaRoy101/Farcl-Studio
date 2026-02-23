// Shared GraphQL response helpers — single source of truth for the whole app.

export interface GqlError {
    message?: string;
    [key: string]: unknown;
}

/**
 * Pull the errors array out of a GraphQL response regardless of whether
 * the server returns { errors } or the batched { body.singleResult.errors } shape.
 */
export function getGqlErrors(json: unknown): GqlError[] {
    const j = json as Record<string, any>;
    return j?.errors ?? j?.body?.singleResult?.errors ?? [];
}

/**
 * Pull the data object out of a GraphQL response regardless of the response shape.
 */
export function getGqlData(json: unknown): Record<string, unknown> | null {
    const j = json as Record<string, any>;
    return j?.data ?? j?.body?.singleResult?.data ?? null;
}
