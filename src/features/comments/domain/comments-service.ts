import {PostId, PostViewModel} from '../../../types/entities/posts-types';
import {commentsRepository} from '../repositories/commentsRepository';
import {
    CommentCreateType,
    CommentId,
    CommentInputModel,
    CommentUpdateType
} from '../../../types/entities/comments-types';
import {UserId, UserViewModel} from '../../../types/entities/users-types';

class NotFoundError {
    constructor(public message: string = 'entity not found') {
    }
}

export const commentsService = {
    async create(postId: PostId, userId: UserId, comment: CommentInputModel): Promise<CommentId | null> {
        const post: PostViewModel | null = await commentsRepository.findPostById(postId)
        const user: UserViewModel | null = await commentsRepository.findUserById(userId)

        if (!post || !user) return null

        if (comment) {
            const newComment: CommentCreateType = {
                content: comment.content,
                postId: post.id,
                commentatorInfo: {
                    userId: user.id,
                    userLogin: user.login,
                },
                createdAt: new Date().toISOString()
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
    async put(userId: UserId, commentId: CommentId, comment: CommentUpdateType,): Promise<boolean | null> {
        const user = await commentsRepository.findUserById(userId)
        const oldComment = await commentsRepository.findCommentById(commentId)

        if (user?.id !== oldComment?.commentatorInfo.userId) {
            return null
        }

        //todo: Обязательно ли при PUT запросе отправлять всю сущность для изменения (даже если изменено одно поле)?

        const updateCommentData: CommentUpdateType = {
            content: comment.content
        }

        return await commentsRepository.put(commentId, updateCommentData)
    },
}