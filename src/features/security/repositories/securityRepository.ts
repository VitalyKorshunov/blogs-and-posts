import {DeviceId, SecurityServiceModel} from '../../../types/entities/security-types';
import {securityCollection} from '../../../db/mongo-db';
import {UserId} from '../../../types/entities/users-types';
import {ObjectId, WithId} from 'mongodb';
import {SecurityDbType} from '../../../types/db/security-db-types';

export const securityRepository = {
    _mapToSecuritySessionServiceModel(securitySession: WithId<SecurityDbType>): SecurityServiceModel {
        const {_id, userId, ...rest} = securitySession

        return {
            id: _id.toString(),
            userId: userId.toString(),
            ...rest
        }
    },

    async deleteAllUserDevicesExceptCurrent(userId: UserId, deviceId: DeviceId): Promise<boolean> {
        const result = await securityCollection.deleteMany({userId: new ObjectId(userId), deviceId: {$ne: deviceId}})

        return !!result.deletedCount
    },
    async deleteUserDeviceByDeviceId(deviceId: DeviceId): Promise<boolean> {
        const result = await securityCollection.deleteOne({deviceId})

        return !!result.deletedCount
    },
    async findUserSessionByDeviceId(deviceId: DeviceId): Promise<SecurityServiceModel | null> {
        const session: WithId<SecurityDbType> | null = await securityCollection.findOne({deviceId})

        return session ? this._mapToSecuritySessionServiceModel(session) : null
    },

    async isSessionByDeviceIdFound(deviceId: DeviceId): Promise<boolean> {
        const session = await securityCollection.countDocuments({deviceId})

        return !!session
    }
}