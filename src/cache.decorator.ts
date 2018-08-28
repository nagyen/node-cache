import { InMemoryCacheProvider } from "./providers/in-memory-cache.provider";
import { RedisCacheProvider } from "./providers/redis-cache.provider";

export interface CacheOptions {
    key?: string;
    ttl?: number;
}

// using singleton for InMemoryCacheProvider
export const inMemoryCache = new RedisCacheProvider();

export function Cache(options: CacheOptions = {}) {
    return function decorator(target: object, methodName: string, descriptor: PropertyDescriptor) {
        var originalMethod = descriptor.value as Function;
        const className = target.constructor.name as string;

        descriptor.value = async function (...args: any[]) {
            let cacheKey = options.key;
            if (!cacheKey) {
                cacheKey = `${className}:${methodName}:${JSON.stringify(args)}`;
            }

            // console.log('Cache Key:', className, methodName, cacheKey);
            console.log('checking cache for:', cacheKey);

            const cacheValue = await inMemoryCache.get(cacheKey);
            if (cacheValue !== undefined) {
                console.log('checking hit for:', cacheKey);
                return cacheValue;
            }
            console.log('cache miss for:', cacheKey);

            // invoke the function with it's parent scope
            const methodCall = originalMethod.apply(this, args);
            let methodResult: any;
            // check if async function
            if (methodCall && methodCall.then && methodCall.catch) {
                methodResult = await methodCall;
            } else {
                methodResult = methodCall;
            }
            console.log('setting cache for:', cacheKey);

            await inMemoryCache.set(cacheKey, methodResult, options.ttl);
            return methodResult;
        };

        return descriptor;
    }
}