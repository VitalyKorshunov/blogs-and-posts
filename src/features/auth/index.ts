import {Router} from 'express';
import {authenticateUserValidators} from './middlewares/authValidators';
import {authControllers} from './controllers/authControllers';


export const authRouter = Router()

authRouter.post('/login', ...authenticateUserValidators, authControllers.authenticateUser)
