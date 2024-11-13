import {LikeStatus} from '../db/comments-db-types';

export type CommentId = string

export type CommentInputModel = {
    content: string
}

export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
    likesInfo: CommentLikeInfo
}

export type CommentUserLikeStatusInfoServiceType = {
    userId: string
    likeStatus: keyof typeof LikeStatus
}

export type CommentUserLikeStatus = {
    myStatus: keyof typeof LikeStatus
}

export type CommentLikeInfo = {
    likesCount: number
    dislikesCount: number
    myStatus: keyof typeof LikeStatus
}

export type CommentServiceModel = {
    id: string
    content: string
    postId: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: Date
}

export type CommentsSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: CommentViewModel[]
}

export type CommentCreateType = {
    content: string
    postId: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: Date
}

export type CommentUpdateType = {
    content: string
}