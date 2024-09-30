import {ObjectId} from 'mongodb';

export type CommentDbType = {
    content: string
    postId: ObjectId
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    }
    createdAt: string
}

export type CommentUpdateDbType = {
    content: string
}

export type CommentsQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}