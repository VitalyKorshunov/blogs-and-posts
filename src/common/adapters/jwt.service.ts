import jwt from 'jsonwebtoken'
import {SETTINGS} from '../../settings';
import {JwtVerifyViewModel} from '../../types/auth/jwt-types';

export const jwtService = {
    async createAccessToken(userId: string): Promise<string | null> {
        try {
            return jwt.sign({id: userId}, SETTINGS.AT_SECRET_KEY, {
                expiresIn: SETTINGS.AT_LIFE_TIME
            });
        } catch (err) {
            return null
        }
    },

    async createRefreshToken(userId: string): Promise<string | null> {
        try {
            return jwt.sign({id: userId}, SETTINGS.RT_SECRET_KEY, {
                expiresIn: SETTINGS.RT_LIFE_TIME
            });
        } catch (err) {
            return null
        }
    },

    async verifyAccessToken(token: string): Promise<JwtVerifyViewModel | null> {
        try {
            return jwt.verify(token, SETTINGS.AT_SECRET_KEY) as JwtVerifyViewModel
        } catch (err) {
            console.error('Access token verify some error')
            return null
        }
    },

    async verifyRefreshToken(token: string): Promise<JwtVerifyViewModel | null> {
        try {
            return jwt.verify(token, SETTINGS.RT_SECRET_KEY) as JwtVerifyViewModel
        } catch (err) {
            console.error('Refresh token verify some error')
            return null
        }
    },
}