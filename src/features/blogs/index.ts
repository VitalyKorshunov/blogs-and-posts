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
import {BlogsControllers} from './controllers/blogsControllers';
import {routersPaths} from '../../common/path/paths';

export const blogsRouter = Router()

const blogsControllers = new BlogsControllers()

blogsRouter.post(
    '/',
    ...blogValidators,
    blogsControllers.createBlog.bind(blogsControllers))

blogsRouter.post(
    '/:id' + routersPaths.posts,
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