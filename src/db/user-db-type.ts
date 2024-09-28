import {ObjectId} from 'mongodb';

export type UserDbType = {
    _id: ObjectId
    login: string
    email: string
    passHash: string
    createdAt: string
}

export type UserDbInputType = {
    login: string
    email: string
    passHash: string
    createdAt: string
}

export type UsersQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
    searchLoginTerm: string | null
    searchEmailTerm: string | null
}
//todo заменить другие сущности похожим типом
export type UserOutputDbViewModel = {
    id: string
    login: string
    email: string
    passHash: string
    createdAt: string
}