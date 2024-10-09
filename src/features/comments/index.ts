import {Router} from 'express'
import {
    deleteCommentsValidators,
    findCommentValidators,
    updateCommentsValidators
} from './middlewares/commentsValidators'
import {commentsControllers} from './controllers/commentsControllers';

export const commentsRouter = Router()

commentsRouter.get(
    '/:id',
    ...findCommentValidators,
    commentsControllers.findComment)

commentsRouter.delete(
    '/:id',
    ...deleteCommentsValidators,
    commentsControllers.deleteComment)

commentsRouter.put(
    '/:id',
    ...updateCommentsValidators,
    commentsControllers.updateComment)
