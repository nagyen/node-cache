export abstract class CacheProvider {
    constructor() { }

    public async abstract get<T>(key: string): Promise<T | undefined>;
    public async abstract set(key: string, value: any, ttl?: number): Promise<void>;
    public async abstract delete(key: string): Promise<boolean>;
    public async abstract clear(): Promise<void>;

}  