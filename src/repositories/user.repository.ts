import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { MESSAGES } from '../helpers/constants/errors';
import Redis from 'ioredis';

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);
  private readonly CACHE_TTL = 3600;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('REDIS_CLIENT') private readonly cacheManager: Redis,
  ) { }

  async findByEmail(email: string): Promise<UserDocument | null> {
    const cacheKey = `user:email:${email}`;

    try {
      const cachedUser = await this.cacheManager.get(cacheKey);
      if (cachedUser) {
        this.logger.log(`Cache hit for user with email: ${email}`);
        return new this.userModel(JSON.parse(cachedUser));
      }
    } catch (err) {
      this.logger.warn(`Redis GET error: ${err.message}`);
    }

    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      try {
        await this.cacheManager.set(cacheKey, JSON.stringify(user.toObject()), 'EX', this.CACHE_TTL);
        this.logger.log(`Cached user with email: ${email}`);
      } catch (err) {
        this.logger.warn(`Redis SET error: ${err.message}`);
      }
    }
    return user;
  }

  async createUser(username: string, email: string, password: string): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      this.logger.warn(`User creation failed: ${MESSAGES.USER_EXISTS_ERROR}`);
      throw new BadRequestException(MESSAGES.USER_EXISTS_ERROR);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ username, email, password: hashedPassword });
    const savedUser = await user.save();

    const emailCacheKey = `user:email:${email}`;
    try {
      await this.cacheManager.set(emailCacheKey, JSON.stringify(savedUser.toObject()), 'EX', this.CACHE_TTL);
      this.logger.log(`Cached user with email: ${email}`);
    } catch (err) {
      this.logger.warn(`Redis SET error: ${err.message}`);
    }

    this.logger.log(`User created successfully: ${username} - ${email}`);
    return savedUser;
  }
}
