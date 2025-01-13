import jwt from 'jsonwebtoken'
import {SETTINGS} from '../../settings';
import {
    PayloadAccessTokenInputType,
    PayloadRefreshTokenInputType,
    VerifyAccessTokenViewModel,
    VerifyRefreshTokenViewModel
} from '../../types/auth/jwt-types';
import {UserId} from '../../types/entities/users-types';
import {DeviceId} from '../../types/entities/security-types';

export const jwtService = {
    async createAccessToken(userId: UserId): Promise<string | null> {
        const accessTokenPayload: PayloadAccessTokenInputType = {
            userId,
        }
        try {
            return jwt.sign(accessTokenPayload, SETTINGS.AT_SECRET_KEY, {
                expiresIn: SETTINGS.AT_LIFE_TIME
            });
        } catch (err) {
            return null
        }
    },

    async createRefreshToken(userId: UserId, deviceId: DeviceId): Promise<string | null> {
        const refreshTokenPayload: PayloadRefreshTokenInputType = {
            userId,
            deviceId
        }
        try {
            return jwt.sign(refreshTokenPayload, SETTINGS.RT_SECRET_KEY, {
                expiresIn: SETTINGS.RT_LIFE_TIME
            });
        } catch (err) {
            return null
        }
    },

    async verifyAccessToken(token: string): Promise<VerifyAccessTokenViewModel | null> {
        try {
            return jwt.verify(token, SETTINGS.AT_SECRET_KEY) as VerifyAccessTokenViewModel
        } catch (err) {
            console.info('Access token verify error')
            return null
        }
    },

    async verifyRefreshToken(token: string): Promise<VerifyRefreshTokenViewModel | null> {
        try {
            return jwt.verify(token, SETTINGS.RT_SECRET_KEY) as VerifyRefreshTokenViewModel
        } catch (err) {
            console.info('Refresh token verify error')
            return null
        }
    },
}