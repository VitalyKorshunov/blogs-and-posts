import {NextFunction, Request, Response} from 'express';
import {jwtService} from '../common/adapters/jwt.service';
import {DeviceId} from '../types/entities/security-types';
import {UserId} from '../types/entities/users-types';
import {VerifyRefreshTokenViewModel} from '../types/auth/jwt-types';
import {securityRepository} from '../features/security/repositories/securityRepository';

export const refreshTokenGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
        res.sendStatus(401)
        return
    }

    const payload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

    if (payload) {
        const {userId, deviceId} = payload
        // TODO: Можно ли так проверять рефрешь токен или это надо делать в сервисах?

        const isSessionByDeviceIdFound = await securityRepository.isSessionByDeviceIdFound(payload.deviceId)
        if (!isSessionByDeviceIdFound) {
            res.sendStatus(401)
            return
        }

        req.user = {id: userId, deviceId: deviceId} as { id: UserId, deviceId: DeviceId }
        next()
    } else {
        res.sendStatus(401)
        return
    }
}