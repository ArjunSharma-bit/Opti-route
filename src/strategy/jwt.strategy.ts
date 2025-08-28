import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtDecodedPayload } from '../auth/jwt.schema';
import { UserRepository } from '../repositories/user.repository';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly userRepository: UserRepository,
    ) {
        const jwtsecret = configService.get<string>('JWT_SECRET');
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtsecret!
        });
    }

    async validate(payload: JwtDecodedPayload): Promise<JwtDecodedPayload | null> {
        await this.userRepository.findByEmail(payload.email);
        return { _id: payload._id, email: payload.email };
    }
}
