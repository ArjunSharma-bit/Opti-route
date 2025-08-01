import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
    ) { }

    async signUp(username: string, email: string, password: string) {
        const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            throw new BadRequestException('Username or Email already exists');
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = new this.userModel({ username, email, password: hashed });
        await user.save();
        return { message: 'User created successfully' };
    }

    async signIn(email: string, password: string) {
        const user = await this.userModel.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password)))
            throw new UnauthorizedException('Invalid credentials');

        const payload = { email: user.email, _id: user._id }
        const token = await this.jwtService.signAsync(payload)
        return {
            access_token: token
        }
    }
}
