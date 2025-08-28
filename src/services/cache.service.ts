import { Injectable, Logger, Inject } from "@nestjs/common";
import Redis from 'ioredis'

export interface UserICache {
    get(key: string): Promise<string | null>;
    set(key: string, val: string, ttl: number): Promise<void>
}

@Injectable()
export class UserCacheService implements UserICache {
    private readonly logger = new Logger(UserCacheService.name);

    constructor(
        @Inject('REDIS_CLIENT') private readonly cacheManager: Redis,
    ) { }

    async get(key: string): Promise<string | null> {
        try {
            return await this.cacheManager.get(key)
        } catch (err) {
            this.logger.warn(`Redis GET Error: ${err.message}`)
            return null;
        }
    }

    async set(key: string, value: string, ttl: number): Promise<void> {
        try {
            await this.cacheManager.set(key, value, 'EX', ttl)
        } catch (err) {
            this.logger.warn(`Redis SET Error: ${err.message}`)
        }
    }
}