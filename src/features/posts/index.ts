import {Router} from 'express'
import {
    createCommentInPostValidator,
    createPostValidators,
    findPostValidator,
    getPostsValidators
} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {routersPaths} from '../../common/path/paths';
import {PostsControllers} from './controllers/postsControllers';

export const postsRouter = Router()

const postsControllers = new PostsControllers()

postsRouter.post(
    '/',
    ...createPostValidators,
    postsControllers.createPost.bind(postsControllers)
)

postsRouter.get(
    '/',
    ...getPostsValidators,
    postsControllers.getPosts.bind(postsControllers)
)

postsRouter.get(
    '/:id',
    findPostValidator,
    postsControllers.findPost.bind(postsControllers)
)

postsRouter.delete(
    '/:id',
    adminMiddleware, findPostValidator,
    postsControllers.delPost.bind(postsControllers)
)

postsRouter.put(
    '/:id',
    findPostValidator, ...createPostValidators,
    postsControllers.updatePost.bind(postsControllers)
)

postsRouter.get(
    '/:id' + routersPaths.comments,
    findPostValidator, ...getPostsValidators,
    postsControllers.getCommentsInPost.bind(postsControllers)
)

postsRouter.post(
    '/:id' + routersPaths.comments,
    ...createCommentInPostValidator,
    postsControllers.createCommentInPost.bind(postsControllers)
)