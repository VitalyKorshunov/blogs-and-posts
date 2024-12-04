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
import {inject, injectable} from 'inversify';


@injectable()
export class CommentsService {
    constructor(
        @inject(CommentsRepository) protected commentsRepository: CommentsRepository
    ) {
    }

    async createComment(postId: PostId, userId: UserId, comment: CommentInputModel): Promise<ResultType<CommentId>> {
        const post: PostServiceModel | null = await this.commentsRepository.findPostById(postId)
        const user: UserServiceModel | null = await this.commentsRepository.findUserById(userId)

        if (!post || !user) return result.notFound('post or user not found')

        if (!comment) return result.notFound('comment not found')

        const newComment: CommentCreateType = {
            content: comment.content,
            postId: post.id,
            commentatorInfo: {
                userId: user.id,
                userLogin: user.login,
            },
            createdAt: new Date()
        }

        const commentId = await this.commentsRepository.createComment(newComment)

        return result.success(commentId)
    }

    async deleteComment(userId: UserId, commentId: CommentId): Promise<ResultType<boolean>> {
        const user = await this.commentsRepository.findUserById(userId);
        const comment = await this.commentsRepository.findCommentById(commentId)

        if (!user || !comment) return result.notFound('user or comment not found')

        if (user.id !== comment.commentatorInfo.userId) {
            return result.notBelongToUser('comment does not belong to user')
        }

        const isCommentDeleted = await this.commentsRepository.deleteComment(commentId)

        return result.success(isCommentDeleted)
    }

    async updateComment(userId: UserId, commentId: CommentId, comment: CommentUpdateType,): Promise<ResultType<boolean>> {
        const user = await this.commentsRepository.findUserById(userId)
        const oldComment = await this.commentsRepository.findCommentById(commentId)

        if (!user || !oldComment) return result.notFound('user or old comment not found')

        if (user.id !== oldComment.commentatorInfo.userId) {
            return result.notBelongToUser('old comment does not belong to user')
        }

        const updateCommentData: CommentUpdateType = {
            content: comment.content
        }

        const isCommentUpdated = await this.commentsRepository.updateComment(commentId, updateCommentData)

        return result.success(isCommentUpdated)
    }

    async updateUserLikeStatusForComment(commentId: CommentId, userId: UserId, newLikeStatus: keyof typeof LikeStatus): Promise<ResultType<null>> {

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