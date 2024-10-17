export type VerifyAccessTokenViewModel = {
    userId: string
    // deviceId: string
    iat: number
    exp: number
}

export type PayloadAccessTokenInputType = {
    userId: string
    // deviceId: string
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

