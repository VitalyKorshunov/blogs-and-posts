import {refreshTokenGuardMiddleware} from '../../../global-middlewares/refreshTokenGuard-middleware';

export const getAllUserDevices = [
    refreshTokenGuardMiddleware
]

export const deleteAllUserDevicesExceptCurrent = [
    refreshTokenGuardMiddleware
]

export const deleteUserDeviceByDeviceId = [
    refreshTokenGuardMiddleware
]