import mongoose, {HydratedDocument, Model, Schema} from 'mongoose';
import {LikeDbType} from '../../../types/db/likes-db-types';
import {LikeStatus, OneOfLikeStatus} from '../../../types/db/comments-db-types';
import {SETTINGS} from '../../../settings';
import {ObjectId} from 'mongodb';

export interface LikeMethodsType {
    updateLike(newLikeStatus: OneOfLikeStatus): void
}

export type HydratedLikeType = HydratedDocument<LikeDbType, LikeMethodsType>

export interface LikeModelType extends Model<LikeDbType, {}, LikeMethodsType> {
    setLike(commentOrPostId: string, likeStatus: OneOfLikeStatus, userId: string, login: string): HydratedLikeType
}

const likesSchema = new mongoose.Schema<LikeDbType>({
        parentId: {type: Schema.Types.ObjectId, required: true},
        userId: {type: Schema.Types.ObjectId, required: true},
        userLogin: {type: String, required: true},
        likeStatus: {enum: LikeStatus, type: String, required: true},
        createdAt: {type: Date},
        updatedAt: {type: Date}
    },
    {timestamps: true})

likesSchema.method('updateLike', function updateLike(newLikeStatus: OneOfLikeStatus): void {
    this.likeStatus = newLikeStatus
})

likesSchema.static('setLike', function setLike(commentOrPostId: string, likeStatus: OneOfLikeStatus, userId: string, login: string): HydratedLikeType {
    return new LikesModel({
        parentId: new ObjectId(commentOrPostId),
        userId: new ObjectId(userId),
        userLogin: login,
        likeStatus: likeStatus
    })
})

export const LikesModel = mongoose.model<LikeDbType, LikeModelType>(SETTINGS.DB.LIKE_COLLECTION_NAME, likesSchema)
