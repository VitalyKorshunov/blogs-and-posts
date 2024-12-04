import {Request, Response} from 'express';
import {DeviceId, SecurityViewModel} from '../../../types/entities/security-types';
import {ResultType, StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {SecurityQueryRepository} from '../repositories/securityQueryRepository';
import {SecurityService} from '../domain/securityService';
import {inject, injectable} from 'inversify';

@injectable()
export class SecurityControllers {
    constructor(
        @inject(SecurityService) protected securityService: SecurityService,
        @inject(SecurityQueryRepository) protected securityQueryRepository: SecurityQueryRepository
    ) {
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

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)

        } else {
            res.sendStatus(401)
        }
    }

    async deleteUserDeviceByDeviceId(req: Request<{ deviceId: DeviceId }>, res: Response) {
        const deviceId: DeviceId = req.params.deviceId
        const {id} = req.user!

        const result: ResultType<null> = await this.securityService.deleteUserDeviceByDeviceId(id, deviceId)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusCode.PermissionDenied) {
            res.sendStatus(403)
        } else if (result.statusCode === StatusCode.NotFound) {
            res.sendStatus(404)
        } else {
            res.sendStatus(401)
        }
    }
}