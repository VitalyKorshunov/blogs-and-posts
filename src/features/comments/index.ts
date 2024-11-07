import {Router} from 'express'
import {
    deleteCommentsValidators,
    findCommentValidators,
    updateCommentsValidators
} from './middlewares/commentsValidators'
import {CommentsControllers} from './controllers/commentsControllers';

export const commentsRouter = Router()
const commentsControllers = new CommentsControllers()

commentsRouter.get(
    '/:id',
    ...findCommentValidators,
    commentsControllers.findComment.bind(commentsControllers))

commentsRouter.delete(
    '/:id',
    ...deleteCommentsValidators,
    commentsControllers.deleteComment.bind(commentsControllers))

commentsRouter.put(
    '/:id',
    ...updateCommentsValidators,
    commentsControllers.updateComment.bind(commentsControllers))
