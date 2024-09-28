import {Request, Response, NextFunction} from 'express';
import {jwtService} from '../common/adapters/jwt.service';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
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
    const payload = await jwtService.verifyToken(token)

    if (payload) {
        req.user = {id: payload.id}
        next()
    } else {
        res.sendStatus(401)
        return
    }
}