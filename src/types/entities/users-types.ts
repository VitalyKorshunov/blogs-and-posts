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
    emailConfirmation: EmailConfirmation
}

export type EmailConfirmation = {
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


