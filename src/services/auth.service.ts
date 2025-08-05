import { Injectable, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/repositories/user.repository';
import * as bcrypt from 'bcrypt';
import { MESSAGES } from 'src/helpers/constants/errors';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    constructor(
        private readonly jwtService: JwtService,
        private readonly userRepository: UserRepository
    ) { }

    async signUp(username: string, email: string, password: string) {
        const user = await this.userRepository.createUser(username, email, password);
        this.logger.log(`Signup successful for User: ${username} - ${email}`)
        return { message: MESSAGES.USER_CREATED_SUCCESS }
    }

    async signIn(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            this.logger.log(`Sigin failed for user: ${email}`)
            throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS_ERROR);
        }
        const payload = { email: user.email, _id: user._id }
        const token = await this.jwtService.signAsync(payload)
        return { access_token: token }
    }
}