import {accessTokenGuardMiddleware} from '../../../global-middlewares/accessTokenGuard-middleware';

export const getAllUserDevices = [
    accessTokenGuardMiddleware
]

export const deleteAllUserDevicesExceptCurrent = [
    accessTokenGuardMiddleware
]

export const deleteUserDeviceByDeviceId = [
    accessTokenGuardMiddleware
]