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
import {routersPaths} from '../../common/path/paths';
import {blogsControllers} from './composition-root';

export const blogsRouter = Router()

blogsRouter.post(
    '/',
    ...blogValidators,
    blogsControllers.createBlog.bind(blogsControllers))

blogsRouter.post(
    '/:id' + routersPaths.posts.posts,
    ...blogPostValidators,
    blogsControllers.createPostInBlog.bind(blogsControllers))

blogsRouter.get(
    '/',
    ...sortBlogsValidators,
    blogsControllers.getBlogs.bind(blogsControllers))

blogsRouter.get(
    '/:id',
    findBlogValidator,
    blogsControllers.findBlog.bind(blogsControllers))

blogsRouter.get(
    '/:id' + SETTINGS.PATH.POSTS,
    ...sortPostsInBlogValidators,
    blogsControllers.getPostsInBlog.bind(blogsControllers))

blogsRouter.delete(
    '/:id',
    adminMiddleware, findBlogValidator,
    blogsControllers.delBlog.bind(blogsControllers))

blogsRouter.put(
    '/:id',
    findBlogValidator, ...blogValidators,
    blogsControllers.updateBlog.bind(blogsControllers))