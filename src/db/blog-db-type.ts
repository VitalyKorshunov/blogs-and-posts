import {ObjectId} from 'mongodb';

export type BlogDbType = {
    _id: ObjectId
    name: string // max 15
    description: string // max 500
    websiteUrl: string // max 100 ^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$
    createdAt: string
    isMembership: boolean
}