import {ObjectId} from 'mongodb';

export type PostDbType = {
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
    blogName: string
    createdAt: Date
}

export type PostUpdateDbType = {
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