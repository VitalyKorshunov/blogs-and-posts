import {UserId} from '../../../types/entities/users-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {DeviceId, SecurityServiceModel} from '../../../types/entities/security-types';
import {securityRepository} from '../repositories/securityRepository';

class SecurityService {
    async deleteAllUserDevicesExceptCurrent(userId: UserId, deviceId: DeviceId): Promise<ResultType<null>> {
        await securityRepository.deleteAllUserDevicesExceptCurrent(userId, deviceId)

        return result.success(null)
    }

    async deleteUserDeviceByDeviceId(userId: UserId, deviceId: DeviceId): Promise<ResultType<null>> {
        const session: SecurityServiceModel | null = await securityRepository.findUserSessionByDeviceId(deviceId)
        if (!session) {
            return result.notFound('not found session by deviceId')
        }

        if (session.userId !== userId) {
            return result.permissionDeniedError('this user cannot delete sessions that are not his own')
        }

        await securityRepository.deleteUserDeviceByDeviceId(deviceId)

        return result.success(null)
    }
}

export const securityService = new SecurityService()