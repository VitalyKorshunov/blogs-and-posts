import {Request, Response} from 'express';
import {ParamType} from '../../../types/request-response/request-types';
import {CommentId, CommentInputModel, CommentViewModel} from '../../../types/entities/comments-types';
import {CommentsService} from '../application/commentsService';
import {CommentsQueryRepository} from '../repositories/commentsQueryRepository';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {accessTokenUtils} from '../../../common/utils/accessToken.utils';
import {LikeStatus} from '../../../types/db/comments-db-types';
import {inject, injectable} from 'inversify';

@injectable()
export class CommentsControllers {
    constructor(
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository
    ) {
    }

    async deleteComment(req: Request<ParamType>, res: Response) {
        const result = await this.commentsService.deleteComment(req.user!.id, req.params.id)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusCode.NotBelongToUser) {
            res.sendStatus(403)
        } else {
            res.sendStatus(404)
        }
    }

    async findComment(req: Request<ParamType>, res: Response<CommentViewModel>) {
        const userId = await accessTokenUtils.getAccessTokenUserId(req)

        const comment = await this.commentsQueryRepository.findCommentById(req.params.id, userId)

        if (comment) {
            res.status(200).json(comment)
        } else {
            res.sendStatus(500)
        }
    }

    async updateComment(req: Request<ParamType, any, CommentInputModel>, res: Response) {
        const result = await this.commentsService.updateComment(req.user!.id, req.params.id, req.body)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusCode.NotBelongToUser) {
            res.sendStatus(403)
        } else {
            res.sendStatus(404)
        }
    }

    async updateUserLikeStatusForComment(req: Request<{ id: CommentId }, {}, {
        likeStatus: LikeStatus
    }>, res: Response) {
        const commentId = req.params.id
        const userId = req.user!.id
        const likeStatus = req.body.likeStatus

        const result = await this.commentsService.updateUserLikeStatusForComment(commentId, userId, likeStatus)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }
}