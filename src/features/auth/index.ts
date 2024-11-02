import {Router} from 'express';
import {
    getUserInfoValidators,
    loginUserValidators,
    logoutUserValidators,
    newPasswordValidators,
    passwordRecoveryValidators,
    refreshTokenValidators,
    registerUserValidators,
    registrationConfirmationEmailValidators,
    resendRegistrationEmailValidators
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

authRouter.post(
    routersPaths.auth.passwordRecovery,
    ...passwordRecoveryValidators,
    authControllers.passwordRecovery
)

authRouter.post(
    routersPaths.auth.newPassword,
    ...newPasswordValidators,
    authControllers.newPassword
)

