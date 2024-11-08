import {UserId} from '../../../types/entities/users-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {DeviceId, SecurityServiceModel} from '../../../types/entities/security-types';
import {SecurityRepository} from '../repositories/securityRepository';

export class SecurityService {
    private securityRepository: SecurityRepository

    constructor() {
        this.securityRepository = new SecurityRepository()
    }

    async deleteAllUserDevicesExceptCurrent(userId: UserId, deviceId: DeviceId): Promise<ResultType<null>> {
        await this.securityRepository.deleteAllUserDevicesExceptCurrent(userId, deviceId)

        return result.success(null)
    }

    async deleteUserDeviceByDeviceId(userId: UserId, deviceId: DeviceId): Promise<ResultType<null>> {
        const session: SecurityServiceModel | null = await this.securityRepository.findUserSessionByDeviceId(deviceId)
        if (!session) {
            return result.notFound('not found session by deviceId')
        }

        if (session.userId !== userId) {
            return result.permissionDeniedError('this user cannot delete sessions that are not his own')
        }

        await this.securityRepository.deleteUserDeviceByDeviceId(deviceId)

        return result.success(null)
    }
}