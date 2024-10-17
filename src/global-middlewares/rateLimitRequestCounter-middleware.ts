import {NextFunction, Request, Response} from 'express';
import {rateLimitCollection} from '../db/mongo-db';
import {RateLimitDBType} from '../types/db/rateLimit-db-types';

export const rateLimitRequestCounterMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl
    const ip = req.ip ?? 'ip not defined'
    const date = new Date()

    const data: RateLimitDBType = {
        IP: ip,
        URL: url,
        date,
    }

    await rateLimitCollection.insertOne(data)

    next()
}

