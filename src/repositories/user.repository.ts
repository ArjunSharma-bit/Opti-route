import { Injectable, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { MESSAGES } from '../helpers/constants/errors';
import Redis from 'ioredis';

@Injectable()
export class UserRepository implements OnModuleInit {
  private readonly logger = new Logger(UserRepository.name);
  private readonly CACHE_TTL = 3600;
  private cacheManager: Redis;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.cacheManager = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      retryStrategy: (times) => Math.min(times * 50, 2000),
    });
  }

  async onModuleInit() {
    try {
      await this.cacheManager.ping();
      this.logger.log('Redis connected successfully.');
    } catch (err) {
      this.logger.error('Redis connection failed:', err);
    }
  }

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
