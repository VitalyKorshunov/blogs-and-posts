import {NextFunction, Request, Response} from 'express';
import {jwtService} from '../common/adapters/jwt.service';

export const refreshTokenGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken as string

    if (!refreshToken) {
        res.sendStatus(401)
        return
    }

    const payload = await jwtService.verifyRefreshToken(refreshToken)

    if (payload) {
        const {userId} = payload

        req.user = {id: userId} as { id: string }
        next()
    } else {
        res.sendStatus(401)
        return
    }
}