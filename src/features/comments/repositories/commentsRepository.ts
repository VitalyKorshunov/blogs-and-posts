import {PostId, PostViewModel} from '../../../types/entities/posts-types'
import {PostDbType} from '../../../types/db/post-db-types'
import {commentCollection, postCollection, userCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';
import {UserDbType} from '../../../types/db/user-db-types';
import {
    CommentCreateType,
    CommentId,
    CommentServiceType,
    CommentUpdateType
} from '../../../types/entities/comments-types';
import {CommentDbType} from '../../../types/db/comments-db-types';

export const commentsRepository = {
    _toIdQuery(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToPostWithCorrectId(post: WithId<PostDbType>): PostViewModel {
        const {_id, blogId, ...rest} = post
        return {
            id: _id.toString(),
            blogId: blogId.toString(),
            ...rest
        }
    },
    _mapToUserWithCorrectId(user: WithId<UserDbType>): UserServiceModel {
        const {_id, ...rest} = user;
        return {
            id: _id.toString(),
            ...rest
        }
    },
    _mapToCommentWithCorrectId(comment: WithId<CommentDbType>): CommentServiceType {
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
    },


    async create(comment: CommentCreateType): Promise<CommentId> {
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
    },
    async del(commentId: CommentId): Promise<boolean> {
        const comment = await commentCollection.deleteOne(this._toIdQuery(commentId))

        return comment.deletedCount === 1
    },
    async put(commentId: CommentId, updateCommentData: CommentUpdateType): Promise<boolean> {
        const commentUpdated = await commentCollection.updateOne(this._toIdQuery(commentId), {$set: updateCommentData})

        return commentUpdated.matchedCount === 1
    },
    async findPostById(postId: PostId): Promise<PostViewModel | null> {
        const post: WithId<PostDbType> | null = await postCollection.findOne(this._toIdQuery(postId));

        return post ? this._mapToPostWithCorrectId(post) : null
    },
    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await userCollection.findOne(this._toIdQuery(userId));

        return user ? this._mapToUserWithCorrectId(user) : null
    },
    async findCommentById(commentId: CommentId): Promise<CommentServiceType | null> {
        const comment: WithId<CommentDbType> | null = await commentCollection.findOne(this._toIdQuery(commentId));

        return comment ? this._mapToCommentWithCorrectId(comment) : null
    },
}