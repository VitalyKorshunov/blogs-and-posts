import {PostId, PostServiceModel} from '../../../types/entities/posts-types';
import {
    CommentCreateType,
    CommentId,
    CommentInputModel,
    CommentUpdateType,
    CommentUserLikeStatusInfoServiceType
} from '../../../types/entities/comments-types';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';
import {CommentsRepository} from '../repositories/commentsRepository';
import {LikeStatus} from '../../../types/db/comments-db-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';

class NotFoundError {
    constructor(public message: string = 'entity not found') {
    }
}

enum statusCode {
    good = 1,
    bad = 0
}

// TODO зарефакторить
export class CommentsService {
    private commentsRepository: CommentsRepository

    constructor() {
        this.commentsRepository = new CommentsRepository()
    }

    async createComment(postId: PostId, userId: UserId, comment: CommentInputModel): Promise<CommentId | null> {
        const post: PostServiceModel | null = await this.commentsRepository.findPostById(postId)
        const user: UserServiceModel | null = await this.commentsRepository.findUserById(userId)

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

            return await this.commentsRepository.createComment(newComment)
        } else {
            throw new NotFoundError('Blog not found (postsService.create)')
        }
    }

    async deleteComment(userId: UserId, commentId: CommentId): Promise<boolean | null> {
        const user = await this.commentsRepository.findUserById(userId);
        const comment = await this.commentsRepository.findCommentById(commentId)

        if (user?.id !== comment?.commentatorInfo.userId) {
            return null
        }

        return this.commentsRepository.deleteComment(commentId)
    }

    async updateComment(userId: UserId, commentId: CommentId, comment: CommentUpdateType,): Promise<{
        statusCode: number
    }> {
        const user = await this.commentsRepository.findUserById(userId)
        const oldComment = await this.commentsRepository.findCommentById(commentId)

        if (user?.id !== oldComment?.commentatorInfo.userId) {
            return {statusCode: statusCode.bad}
        }

        const updateCommentData: CommentUpdateType = {
            content: comment.content
        }

        const isCommentUpdated = await this.commentsRepository.updateComment(commentId, updateCommentData)

        return {statusCode: isCommentUpdated ? statusCode.good : statusCode.bad}
    }

    async updateLikeStatus(commentId: CommentId, userId: UserId, newLikeStatus: keyof typeof LikeStatus): Promise<ResultType<null>> {

        const isCommentFound = await this.commentsRepository.isCommentFound(commentId)
        if (!isCommentFound) {
            return result.notFound('comment not found')
        }

        const userLikeStatusForComment: CommentUserLikeStatusInfoServiceType | null = await this.commentsRepository.findUserLikeStatusForComment(commentId, userId)

        if (userLikeStatusForComment === null && newLikeStatus !== LikeStatus.None) {
            // к лайк или дизлайк +1
            await this.commentsRepository.createUserLikeStatusForComment(commentId, userId, newLikeStatus)

        } else if ((userLikeStatusForComment === null && newLikeStatus === LikeStatus.None)
            || (userLikeStatusForComment?.likeStatus === newLikeStatus)) {
            return result.success(null)

        } else if (userLikeStatusForComment !== null && newLikeStatus === LikeStatus.None) {
            // к лайк или дизлайк -1
            await this.commentsRepository.deleteUserLikeStatusForComment(commentId, userId, userLikeStatusForComment.likeStatus)

        } else if (userLikeStatusForComment !== null && newLikeStatus !== LikeStatus.None) {
            // если был лайк или дизлайк, то к ним -1, а к новому статусу +1
            await this.commentsRepository.updateUserLikeStatusForComment(commentId, userId, userLikeStatusForComment.likeStatus, newLikeStatus)
        }


        return result.success(null)
    }
}