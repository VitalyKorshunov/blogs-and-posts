import {Router} from 'express';
import {routersPaths} from '../../common/path/paths';
import {
    deleteAllUserDevicesExceptCurrent,
    deleteUserDeviceByDeviceId,
    getAllUserDevices
} from './middlewares/securityValidators';
import {SecurityControllers} from './controllers/securityControllers';
import {container} from '../composition-root';

const securityControllers = container.resolve(SecurityControllers)

export const securityRouter = Router()

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