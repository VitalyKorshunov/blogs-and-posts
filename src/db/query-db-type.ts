import {ObjectId} from 'mongodb';

export type IdQueryDbType = {
    _id: ObjectId
}

export type SortQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}