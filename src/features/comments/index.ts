import {Router} from 'express'
import {commentsValidators, findCommentValidator} from './middlewares/commentsValidators'
import {commentsControllers} from './controllers/commentsControllers';
import {authMiddleware} from '../../global-middlewares/auth-middleware';

export const commentsRouter = Router()

commentsRouter.get('/:id', findCommentValidator, commentsControllers.findComment)
commentsRouter.delete('/:id', authMiddleware, findCommentValidator, commentsControllers.delComment)
commentsRouter.put('/:id', ...commentsValidators, commentsControllers.putComment)