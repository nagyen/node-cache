import { CacheItem } from "../models/cache-item.model";
import { CacheProvider } from "./base/cache.provider";
import { RedisClient } from 'redis';
import { promisify } from 'util';

type GetFunction = (key: string) => Promise<string | undefined>;
type SetFunction = (key: string, value: string) => Promise<string | undefined>;

const client: RedisClient = new RedisClient({
    host: 'localhost',
    port: 6379,
});
const getAsync: GetFunction = promisify(client.get).bind(client);
const setAsync: SetFunction = promisify(client.set).bind(client);

export class RedisCacheProvider extends CacheProvider {

    constructor() {
        super();
    }

    public async get<T>(key: string): Promise<T | undefined> {
        let value: any = await getAsync(key);
        if (!value) {
            return undefined;
        }
        // parse any stringified objects
        try {
            value = JSON.parse(value);
        } catch (ex) {
            // if here value is not a stringified object
        }
        return value as T;
    }

    public async set(key: string, value: any, ttl?: number): Promise<void> {

        // stringify any object for now
        // TODO: option to convert to flat hash?
        if (this.isObject(value)) {
            value = JSON.stringify(value);
        } else if (value === undefined) {
            client.del(key);
        }

        if (ttl) {
            client.set(key, value, 'EX', ttl)
        } else {
            client.set(key, value);
        }
    }

    public async delete(key: string): Promise<boolean> {
        // TODO: convert to async
        return client.del(key);
    }

    public async clear(): Promise<void> {
        client.flushall();
    }

    private isObject(val: any) {
        return val && typeof val === 'object';
    }
}