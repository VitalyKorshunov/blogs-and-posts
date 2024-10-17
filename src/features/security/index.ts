import {Router} from 'express';
import {routersPaths} from '../../common/path/paths';
import {
    deleteAllUserDevicesExceptCurrent,
    deleteUserDeviceByDeviceId,
    getAllUserDevices
} from './middlewares/securityValidators';

export const securityRouter = Router()

securityRouter.get(
    routersPaths.security.devices,
    ...getAllUserDevices,

)

securityRouter.delete(
    routersPaths.security.devices,
    ...deleteAllUserDevicesExceptCurrent,

)

securityRouter.delete(
    routersPaths.security.devices + '/:deviceId',
    ...deleteUserDeviceByDeviceId,

)