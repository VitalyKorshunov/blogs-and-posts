import {DeviceId} from '../../../types/entities/security-types';
import {UserId} from '../../../types/entities/users-types';
import {ObjectId} from 'mongodb';
import {injectable} from 'inversify';
import {HydratedSecurityType, SecurityModel} from '../domain/securityEntity';

@injectable()
export class SecurityRepository {
    async deleteAllUserDevicesExceptCurrent(userId: UserId, deviceId: DeviceId): Promise<boolean> {
        const result = await SecurityModel.deleteMany({userId: new ObjectId(userId), deviceId: {$ne: deviceId}})

        return !!result.deletedCount
    }

    async deleteUserDeviceByDeviceId(deviceId: DeviceId): Promise<boolean> {
        const result = await SecurityModel.deleteOne({deviceId})

        return !!result.deletedCount
    }

    async findUserSessionByDeviceId(deviceId: DeviceId): Promise<HydratedSecurityType | null> {
        return  SecurityModel.findOne({deviceId})
    }

    async isSessionByDeviceIdFound(deviceId: DeviceId): Promise<boolean> {
        const session = await SecurityModel.countDocuments({deviceId})

        return !!session
    }
}