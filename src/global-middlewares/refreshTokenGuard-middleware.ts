import {NextFunction, Request, Response} from 'express';
import {jwtService} from '../common/adapters/jwt.service';
import {DeviceId} from '../types/entities/security-types';
import {UserId} from '../types/entities/users-types';

export const refreshTokenGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
        res.sendStatus(401)
        return
    }

    const payload = await jwtService.verifyRefreshToken(refreshToken)

    if (payload) {
        const {userId, deviceId} = payload

        req.user = {id: userId, deviceId} as { id: UserId, deviceId: DeviceId }
        next()
    } else {
        res.sendStatus(401)
        return
    }
}