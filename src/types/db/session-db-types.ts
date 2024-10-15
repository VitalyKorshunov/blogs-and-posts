import {ObjectId} from 'mongodb';

export type SessionDbType = {
    usedId: ObjectId
    deviceId: string
    iat: Date
    device_name: string
    ip: string
    exp: Date
}