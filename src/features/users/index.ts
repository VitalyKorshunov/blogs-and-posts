import {Router} from 'express'
import {findUserValidator, sortUsersValidators, usersValidators,} from './middlewares/usersValidators'
import {adminMiddleware} from '../../global-middlewares/admin-middleware'
import {UsersControllers} from './controllers/usersControllers';
import {container} from '../composition-root';

const usersControllers = container.resolve(UsersControllers)

export const usersRouter = Router()

usersRouter.post(
    '/',
    ...usersValidators,
    usersControllers.createUser.bind(usersControllers)
)

usersRouter.get(
    '/',
    adminMiddleware, ...sortUsersValidators,
    usersControllers.getUsers.bind(usersControllers)
)

usersRouter.delete(
    '/:id',
    adminMiddleware, findUserValidator,
    usersControllers.deleteUser.bind(usersControllers)
)
