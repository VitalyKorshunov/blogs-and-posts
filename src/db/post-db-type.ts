import {ObjectId} from 'mongodb';

export type PostDbOutputType = {
    _id: ObjectId
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
    blogName: string
    createdAt: string
}

export type PostDbWithCorrectIdType = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type PostDbInputType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type PostMongoDbInputType = {
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
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