import {EmailConfirmationType, RecoveryPasswordType} from '../entities/users-types';

export interface UserDbType {
    login: string
    email: string
    passHash: string
    createdAt: Date
    recoveryPassword: RecoveryPasswordType
    emailConfirmation: EmailConfirmationType
}

export type UsersQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
    searchLoginTerm: string | null
    searchEmailTerm: string | null
}