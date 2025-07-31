import { Types } from "mongoose";

export class JwtDecodedPayload {
    _id: Types.ObjectId;
    email: string;
}