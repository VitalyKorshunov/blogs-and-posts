import {Request, Response} from 'express';
import {UserId} from '../../../types/entities/users-types';
import {securityQueryRepository} from '../repositories/securityQueryRepository';
import {DeviceId, SecurityViewModel} from '../../../types/entities/security-types';
import {ResultType, StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {securityService} from '../domain/securityService';

export const securityControllers = {
    async getAllUserDevices(req: Request, res: Response) {
        const userId: UserId = req.user!.id

        const result: SecurityViewModel[] | null = await securityQueryRepository.getAllActiveSessionsByUser(userId)

        if (result) {
            res.status(200).json(result)
        } else {
            res.sendStatus(401)
        }
    },

    async deleteAllUserDevicesExceptCurrent(req: Request, res: Response) {
        //TODO: Как типизировать req чтобы не писать ! после user
        const {id, deviceId} = req.user!

        const result: ResultType<null> = await securityService.deleteAllUserDevicesExceptCurrent(id, deviceId)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)

        } else {
            res.sendStatus(401)
        }
    },

    async deleteUserDeviceByDeviceId(req: Request<{ deviceId: DeviceId }>, res: Response) {
        const deviceId: DeviceId = req.params.deviceId
        const userId: UserId = req.user!.id

        const result: ResultType<null> = await securityService.deleteUserDeviceByDeviceId(userId, deviceId)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusesCode.PermissionDenied) {
            res.sendStatus(403)
        } else if (result.statusCode === StatusesCode.NotFound) {
            res.sendStatus(404)
        } else {
            res.sendStatus(401)
        }
    },
}