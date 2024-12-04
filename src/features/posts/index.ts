import {Router} from 'express'
import {
    createCommentInPostValidator,
    createPostValidators,
    findPostValidator,
    getPostsValidators,
    likeStatusPostsValidators
} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {routersPaths} from '../../common/path/paths';
import {PostsControllers} from './controllers/postsControllers';
import {container} from '../composition-root';

const postsControllers = container.resolve(PostsControllers)

export const postsRouter = Router()

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
    '/:id' + routersPaths.comments.comments,
    findPostValidator, ...getPostsValidators,
    postsControllers.getCommentsInPost.bind(postsControllers)
)

postsRouter.post(
    '/:id' + routersPaths.comments.comments,
    ...createCommentInPostValidator,
    postsControllers.createCommentInPost.bind(postsControllers)
)

postsRouter.put(
    '/:id' + routersPaths.comments.likeStatus,
    ...likeStatusPostsValidators,
    postsControllers.updateUserLikeStatusForPost.bind(postsControllers)
)