import {Router} from 'express';
import {
    authenticateUserValidators,
    verifyEmailValidators,
    registerUserValidators, resendRegistrationEmailValidators
} from './middlewares/authValidators';
import {authControllers} from './controllers/authControllers';
import {authMiddleware} from '../../global-middlewares/auth-middleware';
import {routersPaths} from '../../common/path/paths';


export const authRouter = Router()

authRouter.post(
    routersPaths.auth.login,
    ...authenticateUserValidators,
    authControllers.authenticateUser
)

authRouter.get(
    routersPaths.auth.me,
    authMiddleware,
    authControllers.getUserInfo
)

authRouter.post(
    routersPaths.auth.registration,
    ...registerUserValidators,
    authControllers.registerUser
)

authRouter.post(
    routersPaths.auth.registrationConfirmation,
    ...verifyEmailValidators,
    authControllers.verifyEmail
)

authRouter.post(
    routersPaths.auth.registrationEmailResending,
    ...resendRegistrationEmailValidators,
    authControllers.resendRegistrationEmail
)

