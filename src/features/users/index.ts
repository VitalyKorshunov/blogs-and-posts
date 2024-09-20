import {Router} from 'express'
import {findUserValidator, sortUsersValidators, usersValidators,} from './middlewares/usersValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {usersControllers} from './controllers/usersControllers';

export const usersRouter = Router()

usersRouter.post('/', ...usersValidators, usersControllers.createUser)
usersRouter.get('/', adminMiddleware, ...sortUsersValidators, usersControllers.getUsers)
usersRouter.delete('/:id', adminMiddleware, findUserValidator, usersControllers.delUser)
