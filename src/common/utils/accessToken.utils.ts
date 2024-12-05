import {Request} from 'express';
import {UserId} from '../../types/entities/users-types';
import {PayloadAccessTokenInputType, VerifyAccessTokenViewModel} from '../../types/auth/jwt-types';
import {jwtService} from '../../application/adapters/jwt.service';

export const accessTokenUtils = {
    async getAccessTokenUserId(req: Request): Promise<UserId | null> {
        const auth = req.headers.authorization as string
        if (!auth) {
            return null
        }

        if (auth.split(' ')[0] !== 'Bearer') {
            return null
        }

        const token = auth.split(' ')[1]
        const payload: VerifyAccessTokenViewModel | null = await jwtService.verifyAccessToken(token)

        if (payload) {
            const {userId}: PayloadAccessTokenInputType = payload

            return userId
        } else {
            return null
        }
    }
}