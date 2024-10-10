export type EmailConfirmationCodeInputModel = string

export type AuthInputModel = {
    loginOrEmail: string
    password: string
}

export type UserInfoViewModel = {
    email: string
    login: string
    userId: string
}

export type AuthTokensType = {
    accessToken: string
    refreshToken: string
}