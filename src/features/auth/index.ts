import {Router} from 'express';
import {authenticateUserValidators} from './middlewares/authValidators';
import {authControllers} from './controllers/authControllers';
import {authMiddleware} from '../../global-middlewares/auth-middleware';


export const authRouter = Router()

authRouter.post('/login', ...authenticateUserValidators, authControllers.authenticateUser)
authRouter.get('/me', authMiddleware, authControllers.getUserInfo)
