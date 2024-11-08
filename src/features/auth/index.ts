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
import {routersPaths} from '../../common/path/paths';
import {authControllers} from './composition-root';

export const authRouter = Router()

authRouter.post(
    routersPaths.auth.login,
    ...loginUserValidators,
    authControllers.loginUser.bind(authControllers)
)

authRouter.get(
    routersPaths.auth.me,
    ...getUserInfoValidators,
    authControllers.getUserInfo.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.registration,
    ...registerUserValidators,
    authControllers.registerUser.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.registrationConfirmation,
    ...registrationConfirmationEmailValidators,
    authControllers.registrationConfirmationEmail.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.registrationEmailResending,
    ...resendRegistrationEmailValidators,
    authControllers.resendRegistrationEmail.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.refreshToken,
    ...refreshTokenValidators,
    authControllers.updateTokens.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.logout,
    ...logoutUserValidators,
    authControllers.logoutUser.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.passwordRecovery,
    ...passwordRecoveryValidators,
    authControllers.passwordRecovery.bind(authControllers)
)

authRouter.post(
    routersPaths.auth.newPassword,
    ...newPasswordValidators,
    authControllers.newPassword.bind(authControllers)
)

