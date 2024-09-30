import {Router} from 'express'
import {
    createCommentInPostValidator,
    findPostValidator,
    postValidators,
    sortPostsValidators
} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {postsControllers} from './controllers/postsControllers';

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, postsControllers.createPost)
postsRouter.get('/', ...sortPostsValidators, postsControllers.getPosts)
postsRouter.get('/:id', findPostValidator, postsControllers.findPost)
postsRouter.delete('/:id', adminMiddleware, findPostValidator, postsControllers.delPost)
postsRouter.put('/:id', findPostValidator, ...postValidators, postsControllers.putPost)

postsRouter.get('/:id/comments', findPostValidator, ...sortPostsValidators, postsControllers.getCommentsInPost)
postsRouter.post('/:id/comments', ...createCommentInPostValidator, postsControllers.createCommentInPost)