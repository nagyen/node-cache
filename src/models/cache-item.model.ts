export interface CacheItem {
    value: any,
    metadata: {
        createdAt: number;
        ttl?: number;
    }
}