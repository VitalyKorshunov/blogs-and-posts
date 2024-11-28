import {Router} from 'express'
import {
    deleteCommentsValidators,
    findCommentValidators,
    likeStatusCommentsValidators,
    updateCommentsValidators
} from './middlewares/commentsValidators'
import {CommentsControllers} from './controllers/commentsControllers';
import {routersPaths} from '../../common/path/paths';

export const commentsRouter = Router()
const commentsControllers = new CommentsControllers()

commentsRouter.get(
    '/:id',
    ...findCommentValidators,
    commentsControllers.findComment.bind(commentsControllers)
)

commentsRouter.delete(
    '/:id',
    ...deleteCommentsValidators,
    commentsControllers.deleteComment.bind(commentsControllers)
)

commentsRouter.put(
    '/:id',
    ...updateCommentsValidators,
    commentsControllers.updateComment.bind(commentsControllers)
)


commentsRouter.put(
    '/:id' + routersPaths.comments.likeStatus,
    ...likeStatusCommentsValidators,
    commentsControllers.updateUserLikeStatusForComment.bind(commentsControllers)
)