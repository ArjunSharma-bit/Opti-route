import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

export interface PassService {
    hash(password: string): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>
}

@Injectable()
export class PasswordService implements PassService {
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }

    async compare(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }
}
