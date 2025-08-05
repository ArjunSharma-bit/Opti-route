import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { MESSAGES } from 'src/helpers/constants/errors';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name)
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
  async createUser(username: string, email: string, password: string): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      this.logger.warn(`User creation failed: ${MESSAGES.USER_EXISTS_ERROR}`);
      throw new BadRequestException(MESSAGES.USER_EXISTS_ERROR);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, email, password: hashedPassword });
    this.logger.log(`User created successfully:${username} - ${email}`)
    return user.save();
  }
}