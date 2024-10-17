import {Router} from 'express';
import {routersPaths} from '../../common/path/paths';
import {
    deleteAllUserDevicesExceptCurrent,
    deleteUserDeviceByDeviceId,
    getAllUserDevices
} from './middlewares/securityValidators';
import {securityControllers} from './controllers/securityControllers';

export const securityRouter = Router()

securityRouter.get(
    routersPaths.security.devices,
    ...getAllUserDevices,
    securityControllers.getAllUserDevices
)

securityRouter.delete(
    routersPaths.security.devices,
    ...deleteAllUserDevicesExceptCurrent,
    securityControllers.deleteAllUserDevicesExceptCurrent
)

securityRouter.delete(
    routersPaths.security.devices + '/:deviceId',
    ...deleteUserDeviceByDeviceId,
    securityControllers.deleteUserDeviceByDeviceId
)