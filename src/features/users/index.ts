import {Router} from 'express'
import {findPostValidator, usersValidators, sortPostsValidators} from './middlewares/usersValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {usersControllers} from './controllers/usersControllers';

export const usersRouter = Router()

usersRouter.post('/', ...usersValidators, usersControllers.createUser)
usersRouter.get('/', ...sortPostsValidators, usersControllers.getPosts)
usersRouter.get('/:id', findPostValidator, usersControllers.findPost)
usersRouter.delete('/:id', adminMiddleware, findPostValidator, usersControllers.delPost)
usersRouter.put('/:id', findPostValidator, ...usersValidators, usersControllers.putPost)