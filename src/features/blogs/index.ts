import {Router} from 'express'
import {blogPostValidators, blogValidators, findBlogValidator, sortPostsInBlogValidators} from './middlewares/blogValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {SETTINGS} from '../../settings';
import {blogsControllers} from './controllers/blogsControllers';

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, blogsControllers.createBlog)
blogsRouter.post('/:id' + SETTINGS.PATH.POSTS, ...blogPostValidators, blogsControllers.createPostInBlog)
blogsRouter.get('/', blogsControllers.getBlogs)
blogsRouter.get('/:id', findBlogValidator, blogsControllers.findBlog)
blogsRouter.get('/:id' + SETTINGS.PATH.POSTS, ...sortPostsInBlogValidators, blogsControllers.getSortedPostsInBlog)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, blogsControllers.delBlog)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, blogsControllers.putBlog)