export type VerifyAccessTokenViewModel = {
    userId: string
    iat: number
    exp: number
}

export type PayloadAccessTokenInputType = {
    userId: string
    iat: number
}

export type VerifyRefreshTokenViewModel = {
    userId: string
    deviceId: string
    iat: number
    exp: number
}

export type PayloadRefreshTokenInputType = {
    userId: string
    deviceId: string
    iat: number
}

