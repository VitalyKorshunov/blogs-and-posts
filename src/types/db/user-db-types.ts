import {EmailConfirmationType, RecoveryPasswordType} from '../entities/users-types';

export class UserDbType {
    constructor(
        public login: string,
        public email: string,
        public passHash: string,
        public createdAt: Date,
        public recoveryPassword: RecoveryPasswordType,
        public emailConfirmation: EmailConfirmationType,
    ) {
    }
}

export type UsersQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
    searchLoginTerm: string | null
    searchEmailTerm: string | null
}