import {ObjectId} from 'mongodb';

export type SecurityDbType = {
    userId: ObjectId
    deviceId: string
    lastActiveDate: Date
    deviceName: string
    ip: string
    expireDate: Date
}