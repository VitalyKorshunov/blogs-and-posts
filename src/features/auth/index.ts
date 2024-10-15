import {Router} from 'express';
import {
    loginUserValidators,
    getUserInfoValidators,
    logoutUserValidators,
    refreshTokenValidators,
    registerUserValidators,
    resendRegistrationEmailValidators,
    registrationConfirmationEmailValidators
} from './middlewares/authValidators';
import {authControllers} from './controllers/authControllers';
import {routersPaths} from '../../common/path/paths';


export const authRouter = Router()

authRouter.post(
    routersPaths.auth.login,
    ...loginUserValidators,
    authControllers.loginUser
)

authRouter.get(
    routersPaths.auth.me,
    ...getUserInfoValidators,
    authControllers.getUserInfo
)

authRouter.post(
    routersPaths.auth.registration,
    ...registerUserValidators,
    authControllers.registerUser
)

authRouter.post(
    routersPaths.auth.registrationConfirmation,
    ...registrationConfirmationEmailValidators,
    authControllers.registrationConfirmationEmail
)

authRouter.post(
    routersPaths.auth.registrationEmailResending,
    ...resendRegistrationEmailValidators,
    authControllers.resendRegistrationEmail
)

authRouter.post(
    routersPaths.auth.refreshToken,
    ...refreshTokenValidators,
    authControllers.updateTokens
)

authRouter.post(
    routersPaths.auth.logout,
    ...logoutUserValidators,
    authControllers.logoutUser
)

