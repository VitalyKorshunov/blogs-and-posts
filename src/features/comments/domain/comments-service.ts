import {PostId, PostServiceModel} from '../../../types/entities/posts-types';
import {commentsRepository} from '../repositories/commentsRepository';
import {
    CommentCreateType,
    CommentId,
    CommentInputModel,
    CommentUpdateType
} from '../../../types/entities/comments-types';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';

class NotFoundError {
    constructor(public message: string = 'entity not found') {
    }
}

enum statusCode {
    good = 1,
    bad = 0
}

export const commentsService = {
    async create(postId: PostId, userId: UserId, comment: CommentInputModel): Promise<CommentId | null> {
        const post: PostServiceModel | null = await commentsRepository.findPostById(postId)
        const user: UserServiceModel | null = await commentsRepository.findUserById(userId)

        if (!post || !user) return null

        if (comment) {
            const newComment: CommentCreateType = {
                content: comment.content,
                postId: post.id,
                commentatorInfo: {
                    userId: user.id,
                    userLogin: user.login,
                },
                createdAt: new Date()
            }

            return await commentsRepository.create(newComment)
        } else {
            throw new NotFoundError('Blog not found (postsService.create)')
        }
    },
    async del(userId: UserId, commentId: CommentId): Promise<boolean | null> {
        const user = await commentsRepository.findUserById(userId);
        const comment = await commentsRepository.findCommentById(commentId)

        if (user?.id !== comment?.commentatorInfo.userId) {
            return null
        }

        return commentsRepository.del(commentId)
    },
    async updateComment(userId: UserId, commentId: CommentId, comment: CommentUpdateType,): Promise<{
        statusCode: number
    }> {
        const user = await commentsRepository.findUserById(userId)
        const oldComment = await commentsRepository.findCommentById(commentId)

        if (user?.id !== oldComment?.commentatorInfo.userId) {
            return {statusCode: statusCode.bad}
        }

        const updateCommentData: CommentUpdateType = {
            content: comment.content
        }

        const isCommentUpdated = await commentsRepository.updateComment(commentId, updateCommentData)

        return {statusCode: isCommentUpdated ? statusCode.good : statusCode.bad}
    },
}