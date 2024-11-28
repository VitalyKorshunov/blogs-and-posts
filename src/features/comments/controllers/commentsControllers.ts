import {Request, Response} from 'express';
import {ParamType} from '../../../types/request-response/request-types';
import {CommentId, CommentInputModel, CommentViewModel} from '../../../types/entities/comments-types';
import {CommentsService} from '../domain/comments-service';
import {CommentsQueryRepository} from '../repositories/commentsQueryRepository';
import {StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {accessTokenUtils} from '../../../common/utils/accessToken.utils';
import {LikeStatus} from '../../../types/db/comments-db-types';

export class CommentsControllers {
    private commentsService: CommentsService
    private commentsQueryRepository: CommentsQueryRepository

    constructor() {
        this.commentsService = new CommentsService()
        this.commentsQueryRepository = new CommentsQueryRepository()
    }

    async deleteComment(req: Request<ParamType>, res: Response) {
        const isCommentDeleted = await this.commentsService.deleteComment(req.user!.id, req.params.id)

        if (isCommentDeleted) {
            res.sendStatus(204)
            return
        } else if (isCommentDeleted === null) {
            res.sendStatus(403)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }

    async findComment(req: Request<ParamType>, res: Response<CommentViewModel>) {
        const userId = await accessTokenUtils.getAccessTokenUserId(req)

        const comment = await this.commentsQueryRepository.findCommentById(req.params.id, userId)
        res
            .status(200)
            .json(comment)
    }

    async updateComment(req: Request<ParamType, any, CommentInputModel>, res: Response) {
        const statusCode = await this.commentsService.updateComment(req.user!.id, req.params.id, req.body)

        if (statusCode.statusCode === 1) {
            res.sendStatus(204)
            return
        } else if (statusCode.statusCode === 0) {
            res.sendStatus(403)
            return
        } else {
            res.sendStatus(404)
            return
        }
    }

    async updateUserLikeStatusForComment(req: Request<{ id: CommentId }, {}, { likeStatus: LikeStatus }>, res: Response) {
        const commentId = req.params.id
        const userId = req.user!.id
        const likeStatus = req.body.likeStatus
        console.log('from controllers ', {
            commentId,
            userId,
            likeStatus
        })
        const result = await this.commentsService.updateUserLikeStatusForComment(commentId, userId, likeStatus)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}