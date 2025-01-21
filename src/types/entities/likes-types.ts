import {OneOfLikeStatus} from '../db/comments-db-types';

export type LikesAndDislikesCount = {
    likesCount: number
    dislikesCount: number
}

export type LastNewestLikes = {
    addedAt: string
    userId: string
    login: string
}

export type PostIdWithPostUserLikeStatus = {
    postId: string
    myStatus: OneOfLikeStatus
}