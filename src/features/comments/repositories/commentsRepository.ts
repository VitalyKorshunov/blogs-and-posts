import {PostId, PostServiceModel} from '../../../types/entities/posts-types'
import {PostDbType} from '../../../types/db/post-db-types'
import {commentCollection, PostModel, UserModel} from '../../../db/mongo-db';
import {ObjectId, UpdateResult, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';
import {UserDbType} from '../../../types/db/user-db-types';
import {
    CommentCreateType,
    CommentId,
    CommentServiceModel,
    CommentUpdateType,
    CommentUserLikeStatusInfoServiceType
} from '../../../types/entities/comments-types';
import {CommentDbType, CommentUserLikeStatusInfoDbType, LikeStatus} from '../../../types/db/comments-db-types';
import {injectable} from 'inversify';

@injectable()
export class CommentsRepository {
    private toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToPostWithCorrectId(post: WithId<PostDbType>): PostServiceModel {
        const {_id, blogId, ...rest} = post
        return {
            id: _id.toString(),
            blogId: blogId.toString(),
            ...rest
        }
    }

    private mapToUserWithCorrectId(user: WithId<UserDbType>): UserServiceModel {
        const {_id, ...rest} = user;
        return {
            id: _id.toString(),
            ...rest
        }
    }

    private mapToCommentWithCorrectId(comment: WithId<CommentDbType>): CommentServiceModel {
        const {_id, postId, commentatorInfo, ...rest} = comment;
        return {
            ...rest,
            id: _id.toString(),
            postId: postId.toString(),
            commentatorInfo: {
                userId: commentatorInfo.userId.toString(),
                userLogin: commentatorInfo.userLogin
            }
        }
    }

    private mapToCommentUserInfoWithCorrectId(commentUserInfo: CommentUserLikeStatusInfoDbType): CommentUserLikeStatusInfoServiceType {
        const {userId, ...rest} = commentUserInfo

        return {
            userId: userId.toString(),
            ...rest
        }
    }

    async createComment(comment: CommentCreateType): Promise<CommentId> {
        const commentToDb: CommentDbType = {
            content: comment.content,
            postId: new ObjectId(comment.postId),
            commentatorInfo: {
                userId: new ObjectId(comment.commentatorInfo.userId),
                userLogin: comment.commentatorInfo.userLogin,
            },
            likesAndDislikesInfo: {
                countCommentLikesAndDislikes: {
                    likesCount: 0,
                    dislikesCount: 0
                },
                commentUserLikeStatusInfo: []
            },
            createdAt: comment.createdAt
        }

        const _id = await commentCollection.insertOne(commentToDb)

        return _id.insertedId.toString()
    }

    async deleteComment(commentId: CommentId): Promise<boolean> {
        const comment = await commentCollection.deleteOne(this.toIdQuery(commentId))

        return comment.deletedCount === 1
    }

    async updateComment(commentId: CommentId, updateCommentData: CommentUpdateType): Promise<boolean> {
        const commentUpdated = await commentCollection.updateOne(this.toIdQuery(commentId), {$set: updateCommentData})

        return commentUpdated.matchedCount === 1
    }

    async findPostById(postId: PostId): Promise<PostServiceModel | null> {
        const post: WithId<PostDbType> | null = await PostModel.findOne(this.toIdQuery(postId)).lean();

        return post ? this.mapToPostWithCorrectId(post) : null
    }

    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne(this.toIdQuery(userId)).lean();

        return user ? this.mapToUserWithCorrectId(user) : null
    }

    async findCommentById(commentId: CommentId): Promise<CommentServiceModel | null> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this.toIdQuery(commentId));

        return comment ? this.mapToCommentWithCorrectId(comment) : null
    }

    async isCommentFound(commentId: CommentId): Promise<boolean> {
        const comment = await commentCollection.countDocuments(this.toIdQuery(commentId));

        return !!comment
    }

    async updateUserLikeStatusForComment(commentId: CommentId, userId: UserId, lastLikeStatus: keyof typeof LikeStatus, newLikeStatus: keyof typeof LikeStatus): Promise<boolean> {
        const decrementLikesOrDislikesCount = lastLikeStatus === LikeStatus.Like ? 'likesCount' : 'dislikesCount'
        const incrementLikesOrDislikesCount = newLikeStatus === LikeStatus.Like ? 'likesCount' : 'dislikesCount'

        const comment = await commentCollection.updateOne({
            ...this.toIdQuery(commentId),
            'likesAndDislikesInfo.commentUserLikeStatusInfo.userId': new ObjectId(userId)
        }, {
            $set: {
                'likesAndDislikesInfo.commentUserLikeStatusInfo.$.likeStatus': newLikeStatus,
            },
            $inc: {
                [`likesAndDislikesInfo.countCommentLikesAndDislikes.${decrementLikesOrDislikesCount}`]: -1,
                [`likesAndDislikesInfo.countCommentLikesAndDislikes.${incrementLikesOrDislikesCount}`]: 1,

            }
        });

        return !!comment.matchedCount
    }

    async deleteUserLikeStatusForComment(commentId: CommentId, userId: UserId, lastLikeStatus: keyof typeof LikeStatus): Promise<boolean> {
        const decrementLikesOrDislikesCount = lastLikeStatus === LikeStatus.Like ? 'likesCount' : 'dislikesCount'

        const result: UpdateResult<CommentDbType> = await commentCollection.updateOne(
            this.toIdQuery(commentId),
            {
                $pull: {
                    'likesAndDislikesInfo.commentUserLikeStatusInfo': {userId: new ObjectId(userId)}
                },
                $inc: {
                    [`likesAndDislikesInfo.countCommentLikesAndDislikes.${decrementLikesOrDislikesCount}`]: -1
                }
            });

        return !!result.modifiedCount
    }

    async createUserLikeStatusForComment(commentId: CommentId, userId: UserId, likeStatus: keyof typeof LikeStatus): Promise<boolean> {
        const userLikeStatusInfoToDb : CommentUserLikeStatusInfoDbType = {
            userId: new ObjectId(userId),
            likeStatus: likeStatus
        }

        const incrementLikesOrDislikesCount = likeStatus === LikeStatus.Like ? 'likesCount' : 'dislikesCount'

        const result = await commentCollection.updateOne(
            this.toIdQuery(commentId),
            {
                $push: {
                    'likesAndDislikesInfo.commentUserLikeStatusInfo': userLikeStatusInfoToDb
                },
                $inc: {
                    [`likesAndDislikesInfo.countCommentLikesAndDislikes.${incrementLikesOrDislikesCount}`]: 1
                }
            })

        return !!result.matchedCount
    }

    async findUserLikeStatusForComment(commentId: CommentId, userId: UserId): Promise<CommentUserLikeStatusInfoServiceType | null> {
        const userInfo = await commentCollection.findOne(
            {...this.toIdQuery(commentId), 'likesAndDislikesInfo.commentUserLikeStatusInfo.userId': new ObjectId(userId)},
            {
                projection: {
                    'likesAndDislikesInfo.commentUserLikeStatusInfo.$': 1,
                    _id: 0,
                }
            })

        return userInfo ? this.mapToCommentUserInfoWithCorrectId(userInfo.likesAndDislikesInfo.commentUserLikeStatusInfo[0]) : null
    }
}