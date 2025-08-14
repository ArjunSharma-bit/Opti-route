import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
    providers: [
        {
            provide: 'REDIS_CLIENT',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const host = configService.get<string>('REDIS_HOST');
                const port = configService.get<number>('REDIS_PORT') || 6379;

                const client = new Redis({
                    host,
                    port,
                    retryStrategy: (times) => Math.min(times * 50, 2000),
                });

                client.on('connect', () => {
                    console.log(` Redis connected at ${host}:${port}`);
                });

                client.on('error', (err) => {
                    console.error(' Redis connection error:', err);
                });

                return client;
            },
        },
    ],
    exports: ['REDIS_CLIENT'],
})
export class RedisModule { }
