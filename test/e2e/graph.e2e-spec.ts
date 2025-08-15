import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import mongoose from "mongoose";
import { AppModule } from "../../src/app.module";
import { getAuthToken, optimizeSingle, optimizeMulti, multiGraphResDTO } from "./test-utils";


describe('OptiRoute E2E', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init();

    await mongoose.connect(process.env.MONGO_DSN!)
    await mongoose.connection.dropDatabase();
    await mongoose.connection.collection('users').deleteMany({})
  })

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.collection('users').deleteMany({})
  })

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await app.close();
  })

  it('POST /graph/opti-single should give optimized route', async () => {
    const token = await getAuthToken(app)
    const res = await optimizeSingle(app, token)
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('path')
    expect(res.body).toHaveProperty('distance')
  })

  it('should give error on unauthorized users', async () => {
    const token = 'randomTandom'
    const res = await optimizeSingle(app, token)
    expect(res.status).toBe(401);
  })

  it('should give the correct dto response', async () => {
    const token = await getAuthToken(app)
    const res = await optimizeMulti(app, token)
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual(multiGraphResDTO)
  })


  it('POST /graph/opti-multi should give optimized multi route', async () => {
    const token = await getAuthToken(app)
    const res = await optimizeMulti(app, token)
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('concurrentResults')
    expect(res.body).toHaveProperty('sequentialResults')
  })

  it('should give error on unauthorized users', async () => {
    const token = 'randomTandom'
    const res = await optimizeMulti(app, token)
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toBe('Unauthorized')
  })


})

