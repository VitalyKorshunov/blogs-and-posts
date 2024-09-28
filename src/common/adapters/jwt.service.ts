import jwt from 'jsonwebtoken'
import {SETTINGS} from '../../settings';
import {JwtVerifyViewModel} from '../../input-output-types/jwt-types';

export const jwtService = {
    async createToken(userId: string): Promise<string | null> {
        try {
            return jwt.sign({id: userId}, SETTINGS.SECRET_KEY, {
                expiresIn: SETTINGS.LIFE_TIME_JWT
            });
        } catch (err) {
            return null
        }

    },

    async verifyToken(token: string): Promise<JwtVerifyViewModel | null> {
        try {
            return jwt.verify(token, SETTINGS.SECRET_KEY) as JwtVerifyViewModel
        } catch (err) {
            console.error('Token verify some error')
            return null
        }
    }
}