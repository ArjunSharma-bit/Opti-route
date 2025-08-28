import { Injectable, BadRequestException, Logger, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { MESSAGES } from '../helpers/constants/errors';
import { PasswordService } from '../services/password.service';
import { UserCacheService } from '../services/cache.service';
@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  private readonly CACHE_TTL = 3600;

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly passwordService: PasswordService,
    private readonly cacheService: UserCacheService,
  ) { }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const cacheKey = `user:email:${email}`;
    const cachedUser = await this.cacheService.get(cacheKey);

    if (cachedUser) {
      this.logger.log(`Cache hit for user with email: ${email}`);
      return new this.userModel(JSON.parse(cachedUser));
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      await this.cacheService.set(cacheKey, JSON.stringify(user.toObject()), this.CACHE_TTL);
      this.logger.log(`Cached user with email: ${email}`);
    }
    return user;
  }

  async createUser(username: string, email: string, password: string): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] }).exec();
    if (existingUser) {
      this.logger.warn(`User creation failed: ${MESSAGES.USER_EXISTS_ERROR}`);
      throw new BadRequestException(MESSAGES.USER_EXISTS_ERROR);
    }

    const hashedPassword = await this.passwordService.hash(password);
    const user = new this.userModel({ username, email, password: hashedPassword });
    const savedUser = await user.save();

    const emailCacheKey = `user:email:${email}`;
    await this.cacheService.set(emailCacheKey, JSON.stringify(savedUser.toObject()), this.CACHE_TTL);
    this.logger.log(`Cached user with email: ${email}`);

    this.logger.log(`User created successfully: ${username} - ${email}`);
    return savedUser;
  }
}
