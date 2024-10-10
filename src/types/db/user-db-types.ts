import {EmailConfirmation} from '../entities/users-types';

export type UserDbType = {
    login: string
    email: string
    passHash: string
    createdAt: Date
    refreshToken: string
    emailConfirmation: EmailConfirmation
}

export type UsersQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
    searchLoginTerm: string | null
    searchEmailTerm: string | null
}