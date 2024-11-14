import {ObjectId} from 'mongodb';

export type CommentDbType = {
    content: string
    postId: ObjectId
    commentatorInfo: {
        userId: ObjectId
        userLogin: string
    }
    likesAndDislikesInfo: LikesAndDislikesCommentInfoDbType
    createdAt: Date
}

export type CommentIdWithUserLikeStatusDbType = {
    _id: ObjectId
    likesAndDislikesInfo: Pick<LikesAndDislikesCommentInfoDbType, 'commentUserLikeStatusInfo'>
}
export type LikesAndDislikesCommentInfoDbType = {
    countCommentLikesAndDislikes: CountCommentLikesAndDislikes
    commentUserLikeStatusInfo: CommentUserLikeStatusInfoDbType[]
}

export type CountCommentLikesAndDislikes = {
    likesCount: number
    dislikesCount: number
}
export type CommentUserLikeStatusInfoDbType = {
    userId: ObjectId
    likeStatus: keyof typeof LikeStatus
}

export enum LikeStatus {
    Like = 'Like',
    Dislike = 'Dislike',
    None = 'None',
}

export type OneOfLikeStatus = keyof typeof LikeStatus

export type CommentUpdateDbType = {
    content: string
}

export type CommentsQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}