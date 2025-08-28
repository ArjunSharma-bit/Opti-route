import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserRepository } from './repositories/user.repository';
import { RedisModule } from './redis.module';
import { PasswordService } from './services/password.service';
import { UserCacheService } from './services/cache.service';
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: { expiresIn: config.get('JWT_EXPIRY') },
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'users' }]),
        RedisModule,
    ],
    exports: [JwtModule],
    providers: [AuthService, PasswordService, UserCacheService, JwtStrategy, UserRepository],
    controllers: [AuthController],
})
export class AuthModule { }
