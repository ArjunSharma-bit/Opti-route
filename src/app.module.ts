import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphController } from './graph.controller';
import { GraphService } from './graph.service';
import { AuthModule } from './auth.module';
import { RedisModule } from './redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    AuthModule,
    RedisModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoDsn = configService.get<string>('MONGO_DSN');
        if (!mongoDsn) {
          throw new Error('MONGO_DSN environment variable is not defined');
        }
        return {
          uri: mongoDsn
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [GraphController],
  providers: [GraphService],
})
export class AppModule { }