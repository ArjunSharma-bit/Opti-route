import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
// Test Data
export const testUserSignup = {
    username: 'harambeWasInnocent',
    email: 'lolol@example.com',
    password: 'Passw0rd!---',
};

export const testUserSignin = {
    email: testUserSignup.email,
    password: testUserSignup.password
};

export const singleGraphDTO = {
    from: 'A',
    to: 'B',
    locations: [
        { name: 'A', lat: 10.234, lng: 10.456 },
        { name: 'B', lat: 12.234, lng: 12.456 },
        { name: 'C', lat: 14.234, lng: 14.456 },
    ]
};

export const multiGraphDTO = {
    optimize: [
        {
            locations: [
                { name: 'A', lat: 28.6139, lng: 77.2090 },
                { name: 'B', lat: 28.7041, lng: 77.1025 },
                { name: 'C', lat: 28.5355, lng: 77.3910 }
            ],
            from: 'A',
            to: 'C'
        },
        {
            locations: [
                { name: 'X', lat: 19.0760, lng: 72.8777 },
                { name: 'Y', lat: 18.5204, lng: 73.8567 },
                { name: 'Z', lat: 21.1702, lng: 72.8311 }
            ],
            from: 'X',
            to: 'Z'
        }
    ]
}

export const multiGraphResDTO = {
    concurrentResults: [
        { path: ["A", "B", "C"], distance: 48.272 },
        { path: ["X", "Y", "Z"], distance: 433.711 }
    ],
    sequentialResults: [
        { path: ["A", "B", "C"], distance: 48.272 },
        { path: ["X", "Y", "Z"], distance: 433.711 }
    ]
};


// consTants for Api calls
export const signUpUser = (app: INestApplication, user = testUserSignup) => {
    return request(app.getHttpServer())
        .post('/auth/signup')
        .send(user);
};

export const signInUser = (app: INestApplication, creds = testUserSignin) => {
    return request(app.getHttpServer())
        .post('/auth/signin')
        .send(creds);
};

export const getAuthToken = async (app: INestApplication): Promise<string> => {
    const uniqueEmail = `user-${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    const uniqueUser = {
        ...testUserSignup,
        email: uniqueEmail,
    }
    await signUpUser(app, uniqueUser);
    const res = await signInUser(app, {
        email: uniqueEmail,
        password: testUserSignin.password,
    })
    return res.body.access_token as string;
};

export const optimizeSingle = (app: INestApplication, token: string, dto = singleGraphDTO) => {
    return request(app.getHttpServer())
        .post('/graph/opti-single')
        .set('Authorization', `Bearer ${token}`)
        .send(dto)
}

export const optimizeMulti = (app: INestApplication, token: string, dto = multiGraphDTO) => {
    return request(app.getHttpServer())
        .post('/graph/opti-multi')
        .set('Authorization', `Bearer ${token}`)
        .send(dto)
}