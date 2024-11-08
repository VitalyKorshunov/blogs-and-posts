import {Request, Response} from 'express';
import {DeviceId, SecurityViewModel} from '../../../types/entities/security-types';
import {ResultType, StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {SecurityQueryRepository} from '../repositories/securityQueryRepository';
import {SecurityService} from '../domain/securityService';

export class SecurityControllers {
    private securityQueryRepository: SecurityQueryRepository
    private securityService: SecurityService

    constructor() {
        this.securityQueryRepository = new SecurityQueryRepository()
        this.securityService = new SecurityService()
    }

    async getAllUserDevices(req: Request, res: Response) {
        const {id} = req.user!

        const result: SecurityViewModel[] | null = await this.securityQueryRepository.getAllActiveSessionsByUser(id)

        if (result) {
            res.status(200).json(result)
        } else {
            res.sendStatus(401)
        }
    }

    async deleteAllUserDevicesExceptCurrent(req: Request, res: Response) {
        const {id, deviceId} = req.user!

        const result: ResultType<null> = await this.securityService.deleteAllUserDevicesExceptCurrent(id, deviceId!)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)

        } else {
            res.sendStatus(401)
        }
    }

    async deleteUserDeviceByDeviceId(req: Request<{ deviceId: DeviceId }>, res: Response) {
        const deviceId: DeviceId = req.params.deviceId
        const {id} = req.user!

        const result: ResultType<null> = await this.securityService.deleteUserDeviceByDeviceId(id, deviceId)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusesCode.PermissionDenied) {
            res.sendStatus(403)
        } else if (result.statusCode === StatusesCode.NotFound) {
            res.sendStatus(404)
        } else {
            res.sendStatus(401)
        }
    }
}