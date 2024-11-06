import {PostId, PostServiceModel} from '../../../types/entities/posts-types'
import {PostDbType} from '../../../types/db/post-db-types'
import {commentCollection, PostModel, UserModel} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';
import {UserDbType} from '../../../types/db/user-db-types';
import {
    CommentCreateType,
    CommentId,
    CommentServiceModel,
    CommentUpdateType
} from '../../../types/entities/comments-types';
import {CommentDbType} from '../../../types/db/comments-db-types';

class CommentsRepository {
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

    async createComment(comment: CommentCreateType): Promise<CommentId> {
        const commentToDb: CommentDbType = {
            content: comment.content,
            postId: new ObjectId(comment.postId),
            commentatorInfo: {
                userId: new ObjectId(comment.commentatorInfo.userId),
                userLogin: comment.commentatorInfo.userLogin,
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
        const post: WithId<PostDbType> | null = await PostModel.findOne(this.toIdQuery(postId));

        return post ? this.mapToPostWithCorrectId(post) : null
    }

    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne(this.toIdQuery(userId));

        return user ? this.mapToUserWithCorrectId(user) : null
    }

    async findCommentById(commentId: CommentId): Promise<CommentServiceModel | null> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this.toIdQuery(commentId));

        return comment ? this.mapToCommentWithCorrectId(comment) : null
    }
}

export const commentsRepository = new CommentsRepository()