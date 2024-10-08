import {Router} from 'express'
import {
    blogPostValidators,
    blogValidators,
    findBlogValidator,
    sortBlogsValidators,
    sortPostsInBlogValidators
} from './middlewares/blogValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {SETTINGS} from '../../settings';
import {blogsControllers} from './controllers/blogsControllers';
import {routersPaths} from '../../common/path/paths';

export const blogsRouter = Router()

blogsRouter.post(
    '/',
    ...blogValidators,
    blogsControllers.createBlog)

blogsRouter.post(
    '/:id' + routersPaths.posts,
    ...blogPostValidators,
    blogsControllers.createPostInBlog)

blogsRouter.get(
    '/',
    ...sortBlogsValidators,
    blogsControllers.getBlogs)

blogsRouter.get(
    '/:id',
    findBlogValidator,
    blogsControllers.findBlog)

blogsRouter.get(
    '/:id' + SETTINGS.PATH.POSTS,
    ...sortPostsInBlogValidators,
    blogsControllers.getPostsInBlog)

blogsRouter.delete(
    '/:id',
    adminMiddleware, findBlogValidator,
    blogsControllers.delBlog)

blogsRouter.put(
    '/:id',
    findBlogValidator, ...blogValidators,
    blogsControllers.updateBlog)