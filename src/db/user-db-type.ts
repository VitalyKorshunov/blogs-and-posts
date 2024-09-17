import {ObjectId} from 'mongodb';

export type UserDbType = {
    _id: ObjectId
    login: string // max 30
    email: string // max 100
    passHash: string // max 1000
    createdAt: string // valid
}

export type UsersQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}