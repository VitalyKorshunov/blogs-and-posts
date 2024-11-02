export type UserId = string

export type UserInputModel = {
    login: string
    password: string
    email: string
}

export type UserViewModel = {
    id: string
    login: string
    email: string
    createdAt: string
}

export type UserServiceModel = {
    id: string
    login: string
    email: string
    passHash: string
    createdAt: Date
    recoveryPassword: RecoveryPasswordType
    emailConfirmation: EmailConfirmationType
}

export type RecoveryPasswordType = {
    expirationDate: Date
    recoveryCode: string
}

export type PasswordUpdateWithRecoveryType = Pick<UserServiceModel, 'passHash' | 'recoveryPassword'>

export type EmailConfirmationType = {
    expirationDate: Date
    confirmationCode: string
    isConfirmed: boolean
}

export type UsersSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: UserViewModel[]
}


