import { CacheFlow } from "./cache-flow";

export interface CacheTTL {
    inMemTTL: number;
    redisTTL: number;
}

export interface CacheOptions {
    key?: string;
    ttl?: number | CacheTTL;
}

// using singleton for CacheFlow
export const cache = new CacheFlow();

export function Cache(options: CacheOptions = {}) {
    return function decorator(target: object, methodName: string, descriptor: PropertyDescriptor) {
        var originalMethod = descriptor.value as Function;
        const className = target.constructor.name as string;

        descriptor.value = async function (...args: any[]) {
            let cacheKey = options.key;
            if (!cacheKey) {
                cacheKey = `${className}:${methodName}:${JSON.stringify(args)}`;
            }

            console.log('checking cache for:', cacheKey);

            const cacheValue = await cache.get(options);
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

            await cache.set(methodResult, options);
            return methodResult;
        };

        return descriptor;
    }
}