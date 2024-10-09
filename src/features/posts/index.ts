import {Router} from 'express'
import {
    createCommentInPostValidator,
    createPostValidators,
    findPostValidator,
    getPostsValidators
} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {postsControllers} from './controllers/postsControllers';
import {routersPaths} from '../../common/path/paths';

export const postsRouter = Router()

postsRouter.post(
    '/',
    ...createPostValidators,
    postsControllers.createPost)

postsRouter.get(
    '/',
    ...getPostsValidators,
    postsControllers.getPosts)

postsRouter.get(
    '/:id',
    findPostValidator,
    postsControllers.findPost)

postsRouter.delete(
    '/:id',
    adminMiddleware, findPostValidator,
    postsControllers.delPost)

postsRouter.put(
    '/:id',
    findPostValidator, ...createPostValidators,
    postsControllers.updatePost)

postsRouter.get(
    '/:id' + routersPaths.comments,
    findPostValidator, ...getPostsValidators,
    postsControllers.getCommentsInPost)

postsRouter.post(
    '/:id' + routersPaths.comments,
    ...createCommentInPostValidator,
    postsControllers.createCommentInPost)