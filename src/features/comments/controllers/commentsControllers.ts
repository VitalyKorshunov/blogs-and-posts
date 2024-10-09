import {Request, Response} from 'express';
import {commentsService} from '../domain/comments-service';
import {commentsQueryRepository} from '../repositories/commentsQueryRepository';
import {ParamType} from '../../../types/request-response/request-types';
import {CommentInputModel, CommentViewModel} from '../../../types/entities/comments-types';

export const commentsControllers = {
    async deleteComment(req: Request<ParamType>, res: Response) {
        const isCommentDeleted = await commentsService.deleteComment(req.user!.id, req.params.id)

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
    },

    async findComment(req: Request<ParamType>, res: Response<CommentViewModel>) {
        const comment = await commentsQueryRepository.findAndMap(req.params.id)
        res
            .status(200)
            .json(comment)
    },

    async updateComment(req: Request<ParamType, any, CommentInputModel>, res: Response) {
        const statusCode = await commentsService.updateComment(req.user!.id, req.params.id, req.body)

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
    },
}