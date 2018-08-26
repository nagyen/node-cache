import { CacheItem } from "../models/cache-item.model";
import { CacheProvider } from "./base/cache.provider";

const memCache: Map<string, CacheItem> = new Map();

export class InMemoryCacheProvider extends CacheProvider {

    constructor() { super(); }

    public async get<T>(key: string): Promise<T | undefined> {
        const cacheItem = memCache.get(key);
        if (!cacheItem) {
            return undefined;
        }
        if (this.isExpired(cacheItem)) {
            this.delete(key);
            return undefined;
        }
        let value = cacheItem.value;
        // parse any stringified objects
        try {
            value = JSON.parse(cacheItem.value);
        } catch (ex) {
            // if here value is not a stringified object
        }
        return value as T;
    }

    public async set(key: string, value: any, ttl?: number): Promise<void> {

        // stringify any object for immutability
        // and to allow garbage collector to free up the object's memory reference
        if (this.isObject(value)) {
            value = JSON.stringify(value);
        } else if (value === undefined) {
            this.delete(key);
        }

        const cacheItem = {
            value,
            metadata: {
                createdAt: Date.now(),
                ttl,
            }
        };
        memCache.set(key, cacheItem);
    }

    public async delete(key: string): Promise<boolean> {
        return Promise.resolve(memCache.delete(key));
    }

    public async clear(): Promise<void> {
        memCache.clear();
    }

    private isExpired(cache: CacheItem): boolean {
        // check if ttl is set
        if (cache && cache.metadata && cache.metadata.ttl) {
            return Date.now() > cache.metadata.createdAt + (cache.metadata.ttl * 1000);
        }
        // if no ttl consider as non expiring item
        return false;
    }

    private isObject(val: any) {
        return val && typeof val === 'object';
    }
}