import { INestApplication, ValidationPipe, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import { AppModule } from '../../src/app.module';
import { MESSAGES } from '../../src/helpers/constants/errors';
import * as bcrypt from 'bcrypt';
import { testUserSignin, testUserSignup, signInUser, signUpUser, getAuthToken, optimizeSingle } from './test-utils';
import * as request from 'supertest'

describe('Auth/Opti E2E', () => {
  let app: INestApplication;
  let redisClient: Redis;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    await mongoose.connect(process.env.MONGO_DSN!);
    await mongoose.connection.collection('users').deleteMany({});

    // Setup Redis client
    redisClient = app.get('REDIS_CLIENT')
    await redisClient.flushdb();
  });

  beforeEach(async () => {
    await mongoose.connection.collection('users').deleteMany({})
  })

  afterAll(async () => {
    if (redisClient) {
      await redisClient.flushdb();
      await redisClient.quit();
    }

    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await app.close();
  });

  it('POST /auth/signup --> should create user', async () => {
    const res = await signUpUser(app);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe(MESSAGES.USER_CREATED_SUCCESS)
  });

  it('should throw an Error if user already exists ', async () => {
    await signUpUser(app);

    const res2 = await signUpUser(app)
    expect(res2.status).toBe(400)
    expect(res2.body).toHaveProperty('message')
    expect(res2.body.message).toBe(MESSAGES.USER_EXISTS_ERROR)
  })

  it('should have cached user in redis after signup', async () => {
    await signUpUser(app);
    const cacheKey = `user:email:${testUserSignup.email}`;
    const cached = await redisClient.get(cacheKey);
    expect(cached).toBeTruthy();
    const parsed = JSON.parse(cached as string)
    expect(parsed.email).toBe(testUserSignup.email)
    expect(parsed.username).toBe(testUserSignup.username)
  })

  it('should log Redis GET error when redis.get throws', async () => {
    const getSpy = jest.spyOn(redisClient, 'get').mockImplementationOnce(() => {
      throw new Error('Forced GET error');
    });
    const logSpy = jest.spyOn(Logger.prototype, 'warn');

    await signUpUser(app).expect(201);
    await signInUser(app, testUserSignin);

    expect(getSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Redis GET Error: Forced GET error'));

    getSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should log Redis SET error when redis.set throws', async () => {
    const setSpy = jest.spyOn(redisClient, 'set').mockImplementationOnce(() => {
      throw new Error('Forced SET error');
    });
    const logSpy = jest.spyOn(Logger.prototype, 'warn');

    await signUpUser(app).expect(201);

    expect(setSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Redis SET Error: Forced SET error'));

    setSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('should read Redis config correctly', async () => {
    expect((redisClient as any).options.host).toBe('redis-test')
    expect((redisClient as any).options.port).toBe(6379)

  })

  it('POST /auth/signin --> should return access_token', async () => {
    const res = await signInUser(app)
      .expect(200);
    expect(res.body).toHaveProperty('access_token');
  });
  it('should check the passwords for validity', async () => {
    await signInUser(app)
      .expect(200)
    const hashedPassword = await bcrypt.hash(testUserSignup.password, 10)
    const compare = await bcrypt.compare(testUserSignin.password, hashedPassword)
    expect(compare).toBeTruthy();
  })


  it('should return 401 on Invalid password', async () => {
    await signUpUser(app);
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: testUserSignin.email,
        password: 'woajff'
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe(MESSAGES.INVALID_CREDENTIALS_ERROR)
  })

  it('should return 401 on Invalid credentials', async () => {
    await signUpUser(app);
    const res = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'wubbadub@example.com',
        password: testUserSignin.password
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe(MESSAGES.INVALID_CREDENTIALS_ERROR)
  })

  it('should hit the Redis cache if cached', async () => {
    const redisClient = app.get('REDIS_CLIENT')
    const getSpy = jest.spyOn(redisClient, 'get')
    await signUpUser(app).expect(201)

    const res = await signInUser(app, testUserSignin);
    expect(getSpy).toHaveBeenCalled();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('access_token')
  })

  it('should optimize route with valid token', async () => {
    const token = await getAuthToken(app);
    const res = await optimizeSingle(app, token);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('path');
    expect(res.body).toHaveProperty('distance');
  });

});
