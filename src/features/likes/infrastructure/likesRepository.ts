import {injectable} from 'inversify';
import {HydratedLikeType, LikesModel} from '../domain/like-entity';
import {ObjectId} from 'mongodb';
import {LastNewestLikes, LikesAndDislikesCount} from '../../../types/entities/likes-types';
import {LikeStatus} from '../../../types/db/comments-db-types';

@injectable()
export class LikesRepository {
    async save(likeModel: HydratedLikeType): Promise<void> {
        await likeModel.save()
    }

    async findLike(postOrCommentId: string, userId: string): Promise<HydratedLikeType | null> {
        return LikesModel.findOne({
            parentId: new ObjectId(postOrCommentId),
            userId: new ObjectId(userId)
        })
    }

    async getLikesAndDislikesCount(postOrCommentId: string): Promise<LikesAndDislikesCount> {
        const likesCount = await LikesModel.countDocuments({
            parentId: new ObjectId(postOrCommentId),
            likeStatus: LikeStatus.Like
        })

        const dislikesCount = await LikesModel.countDocuments({
            parentId: new ObjectId(postOrCommentId),
            likeStatus: LikeStatus.Dislike
        })

        return {
            likesCount,
            dislikesCount
        }
    }

    async getLastThreeNewestLikes(postOrCommentId: string): Promise<LastNewestLikes[]> {
        const likes: HydratedLikeType[] = await LikesModel
            .find({parentId: postOrCommentId, likeStatus: LikeStatus.Like})
            .sort({createdAt: 'desc'})
            .limit(3)

        return likes.map(like => {
            return {
                userId: like.userId.toString(),
                login: like.userLogin,
                addedAt: like.createdAt.toISOString()
            }
        })
    }

}