export type VerifyAccessTokenViewModel = {
    userId: string
    iat: number
    exp: number
}

export type PayloadAccessTokenInputType = {
    userId: string
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
}

