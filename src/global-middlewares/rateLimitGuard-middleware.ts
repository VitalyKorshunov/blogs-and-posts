import {sub} from 'date-fns';
import {rateLimitCollection} from '../db/mongo-db';
import {NextFunction, Request, Response} from 'express';

export const rateLimitGuardMiddlewares = async (req: Request, res: Response, next: NextFunction) => {
    const timeLimitInSec = 10
    const retryCount = 5

    const filter = {
        IP: req.ip,
        URL: req.originalUrl,
        date: {
            $gte: sub(new Date(), {
                seconds: timeLimitInSec
            })
        }
    }
console.log(req.ip)
    const requestsCount = await rateLimitCollection.countDocuments(filter)

    if (requestsCount > retryCount) {
        res.sendStatus(429)
        return
    }

    next()
}