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

export type UpdatedPostDbType = {
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: ObjectId // valid
}