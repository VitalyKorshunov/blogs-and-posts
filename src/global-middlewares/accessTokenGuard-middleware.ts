import {NextFunction, Request, Response} from 'express';
import {jwtService} from '../common/adapters/jwt.service';

export const accessTokenGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization as string
    if (!auth) {
        res.sendStatus(401)
        return
    }

    if (auth.split(' ')[0] !== 'Bearer') {
        res.sendStatus(401)
        return
    }

    const token = auth.split(' ')[1]
    const payload = await jwtService.verifyAccessToken(token)

    if (payload) {
        const {userId} = payload

        req.user = {id: userId} as { id: string }
        next()
    } else {
        res.sendStatus(401)
        return
    }
}