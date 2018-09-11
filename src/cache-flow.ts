import { CacheOptions, CacheTTL } from "./cache.decorator";
import { InMemoryCacheProvider } from "./providers/in-memory-cache.provider";
import { RedisCacheProvider } from "./providers/redis-cache.provider";

export class CacheFlow {

    private inMemoryCache: InMemoryCacheProvider;
    private redisCache: RedisCacheProvider;

    constructor() {
        this.inMemoryCache = new InMemoryCacheProvider();
        this.redisCache = new RedisCacheProvider();
    }

    public async get<T>(options: CacheOptions): Promise<T | undefined> {
        if (!options.key) {
            return;
        }
        let res = await this.inMemoryCache.get<T>(options.key);
        if (res) {
            return res;
        }
        res = await this.redisCache.get<T>(options.key);
        await this.inMemoryCache.set(options.key, res, this.getInMemTTL(options));
        return res;
    }

    public async set(value: any, options: CacheOptions): Promise<void> {
        if (!options.key) {
            return;
        }
        await this.redisCache.set(options.key, value, this.getRedisTTL(options));
        await this.inMemoryCache.set(options.key, value, this.getInMemTTL(options));
    }

    public async delete(key: string): Promise<void> {
        await this.redisCache.delete(key);
        await this.inMemoryCache.delete(key);
    }

    public async clear(): Promise<void> {
        await this.redisCache.clear();
        await this.inMemoryCache.clear();
    }

    private getInMemTTL(options: CacheOptions): number {
        if (options && this.isObject(options.ttl)) {
            return (options.ttl as CacheTTL).inMemTTL;
        }
        return options.ttl as number;
    }

    private getRedisTTL(options: CacheOptions): number {
        if (options && this.isObject(options.ttl)) {
            return (options.ttl as CacheTTL).redisTTL;
        }
        return options.ttl as number;
    }

    private isObject(val: any) {
        return val && typeof val === 'object';
    }
}