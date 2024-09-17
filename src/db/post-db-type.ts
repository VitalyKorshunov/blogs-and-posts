import {ObjectId} from 'mongodb';

export type PostDbType = {
    _id: ObjectId
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: ObjectId // valid
    blogName: string
    createdAt: string
}

export type UpdatePostDbType = {
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
    blogName: string
}

export type PostsQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}