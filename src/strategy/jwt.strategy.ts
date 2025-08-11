import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtDecodedPayload } from 'src/auth/jwt.schema';
import { UserRepository } from 'src/repositories/user.repository';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly userRepository: UserRepository,
    ) {
        const jwtsecret = configService.get<string>('JWT_SECRET');
        if (!jwtsecret) {
            throw new Error('JWT_SECRET is not defined in the environment variables')
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtsecret
        });
    }

    async validate(payload: JwtDecodedPayload): Promise<JwtDecodedPayload | null> {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            return null;
        }
        return { _id: payload._id, email: payload.email };
    }
}
