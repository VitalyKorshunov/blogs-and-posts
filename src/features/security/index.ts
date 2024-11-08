import {Router} from 'express';
import {routersPaths} from '../../common/path/paths';
import {
    deleteAllUserDevicesExceptCurrent,
    deleteUserDeviceByDeviceId,
    getAllUserDevices
} from './middlewares/securityValidators';
import {SecurityControllers} from './controllers/securityControllers';

export const securityRouter = Router()

const securityControllers = new SecurityControllers()

securityRouter.get(
    routersPaths.security.devices,
    ...getAllUserDevices,
    securityControllers.getAllUserDevices.bind(securityControllers)
)

securityRouter.delete(
    routersPaths.security.devices,
    ...deleteAllUserDevicesExceptCurrent,
    securityControllers.deleteAllUserDevicesExceptCurrent.bind(securityControllers)
)

securityRouter.delete(
    routersPaths.security.devices + '/:deviceId',
    ...deleteUserDeviceByDeviceId,
    securityControllers.deleteUserDeviceByDeviceId.bind(securityControllers)
)