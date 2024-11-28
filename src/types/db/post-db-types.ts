import {ObjectId} from 'mongodb';
import {LikeStatus} from './comments-db-types';

export type PostDbType = {
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
    blogName: string
    likesAndDislikesInfo: LikesAndDislikesPostsInfoDbType
    createdAt: Date
}

export type LikesAndDislikesPostsInfoDbType = {
    countPostsLikesAndDislikes: CountPostsLikesAndDislikes
    postsUserLikeStatusInfo: PostsUserLikeStatusInfoDbType[]
}

export type CountPostsLikesAndDislikes = {
    likesCount: number
    dislikesCount: number
}
export type PostsUserLikeStatusInfoDbType = {
    userId: ObjectId
    likeStatus: keyof typeof LikeStatus
    firstStatusCreatedAt: Date
}

export type PostUpdateDbType = {
    title: string
    shortDescription: string
    content: string
    blogId: ObjectId
    blogName: string
}

export type PostsQueryDbType = {
    pageNumber: number
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}