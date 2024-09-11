import {Router} from 'express'
import {findPostValidator, postValidators} from './middlewares/postValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {postsControllers} from './controllers/postsControllers';

export const postsRouter = Router()

postsRouter.post('/', ...postValidators, postsControllers.createPost)
postsRouter.get('/', postsControllers.getPosts)
postsRouter.get('/:id', findPostValidator, postsControllers.findPost)
postsRouter.delete('/:id', adminMiddleware, findPostValidator, postsControllers.delPost)
postsRouter.put('/:id', findPostValidator, ...postValidators, postsControllers.putPost)