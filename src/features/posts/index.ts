import {Router} from 'express'
import {createPostController} from './controllers/createPostController'
import {getPostsController} from './controllers/getPostsController'
import {findPostController} from './controllers/findPostController'
import {delPostController} from './controllers/delPostController'
import {putPostController} from './controllers/putPostController'
import {findPostValidator, postValidators} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, createPostController)
postsRouter.get('/', getPostsController)
postsRouter.get('/:id', findPostController)
postsRouter.delete('/:id', delPostController)
postsRouter.put('/:id', putPostController)

// не забудьте добавить роут в апп