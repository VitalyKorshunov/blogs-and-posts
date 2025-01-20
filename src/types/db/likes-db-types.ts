import {ObjectId} from 'mongodb';
import {OneOfLikeStatus} from './comments-db-types';

export type LikesDbType = {
    parentId: ObjectId
    userId: ObjectId
    userLogin: string
    likeStatus: OneOfLikeStatus
    createdAt: Date
    updatedAt: Date
}

