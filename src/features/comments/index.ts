import {Router} from 'express'
import {
    deleteCommentsValidators,
    findCommentValidators,
    likeStatusCommentsValidators,
    updateCommentsValidators
} from './middlewares/commentsValidators'
import {CommentsControllers} from './controllers/commentsControllers';
import {routersPaths} from '../../common/path/paths';
import {container} from '../composition-root';

const commentsControllers = container.resolve(CommentsControllers)

export const commentsRouter = Router()

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