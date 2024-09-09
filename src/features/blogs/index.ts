import {Router} from 'express'
import {createBlogController} from './controllers/createBlogController'
import {getBlogsController} from './controllers/getBlogsController'
import {findBlogController} from './controllers/findBlogController'
import {delBlogController} from './controllers/delBlogController'
import {putBlogController} from './controllers/putBlogController'
import {blogValidators, findBlogValidator} from './middlewares/blogValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {postValidators} from '../posts/middlewares/postValidators';
import {createPostForBlogController} from './controllers/createPostForBlogController';

export const blogsRouter = Router()

blogsRouter.post('/', ...blogValidators, createBlogController)
blogsRouter.post('/:id/posts', ...postValidators, createPostForBlogController)
blogsRouter.get('/', getBlogsController)
blogsRouter.get('/:id', findBlogValidator, findBlogController)
blogsRouter.delete('/:id', adminMiddleware, findBlogValidator, delBlogController)
blogsRouter.put('/:id', findBlogValidator, ...blogValidators, putBlogController)

// не забудьте добавить роут в апп