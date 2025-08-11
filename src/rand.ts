import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
    imports: [
        ConfigModule,
        CacheModule.registerAsync({
            isGlobal: true, // Make CacheModule global for all modules
            useFactory: async (configService: ConfigService) => {
                const logger = new Logger('RedisModule');
                const redisHost = configService.get<string>('REDIS_HOST', 'redis');
                const redisPort = configService.get<number>('REDIS_PORT', 6379);
                logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);
                return {
                    store: await redisStore({
                        socket: { host: redisHost, port: redisPort },
                        ttl: configService.get<number>('CACHE_TTL', 3600),
                    }),
                    ttl: configService.get<number>('CACHE_TTL', 3600),
                };
            },
            inject: [ConfigService],
        }),
    ],
    exports: [CacheModule],
})
export class RedisModule { }