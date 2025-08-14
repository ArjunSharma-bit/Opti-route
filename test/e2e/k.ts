import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import * as mongoose from 'mongoose';

export async function createTestApp(): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
    }).compile();

    const app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    return app;
}

export async function closeTestApp(app: INestApplication) {
    try {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    } catch (err) {
        console.log("Error closing app ", err)
    }
    await app.close();
}

