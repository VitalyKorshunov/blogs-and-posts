import {Request, Response} from 'express';
import {AuthInputModel, AuthTokensType} from '../../../types/auth/auth-types';
import {authService} from '../domain/auth-service';
import {authQueryRepository} from '../repositories/authQueryRepository';
import {UserInputModel} from '../../../types/entities/users-types';
import {handleError, StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {DeviceName, IP} from '../../../types/entities/security-types';

export const authControllers = {
    async loginUser(req: Request<{}, {}, AuthInputModel>, res: Response) {
        const {loginOrEmail, password}: AuthInputModel = req.body
        const deviceName: DeviceName = req.headers['user-agent'] ?? 'anonymous device'
        const ip: IP = req.ip ?? 'ip not defined'

        const result = await authService.loginUser(loginOrEmail, password, deviceName, ip);

        if (result.statusCode === StatusesCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = result.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            handleError(result, res)
        }
    },

    async logoutUser(req: Request, res: Response) {
        const result = await authService.logoutUser(req.cookies.refreshToken)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    },

    async getUserInfo(req: Request, res: Response) {
        const userInfo = await authQueryRepository.getUserById(req.user!.id)

        if (userInfo) {
            res.status(200).json(userInfo)
        } else {
            res.sendStatus(401)
        }
    },

    async registerUser(req: Request, res: Response) {
        const {login, email, password}: UserInputModel = req.body
        const result = await authService.registrationUser({login, email, password})

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    },

    async registrationConfirmationEmail(req: Request, res: Response) {
        const result = await authService.registrationConfirmationEmail(req.body.code)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    },

    async resendRegistrationEmail(req: Request, res: Response) {
        const result = await authService.resendRegistrationEmail(req.body.email)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    },

    async updateTokens(req: Request, res: Response) {
        const {refreshToken} = req.cookies

        const result = await authService.updateTokens(refreshToken)

        if (result.statusCode === StatusesCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = result.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            handleError(result, res)
        }
    },

    async passwordRecovery(req: Request, res: Response) {
        const {email} = req.body;

        const result = await authService.passwordRecovery(email)

        res.sendStatus(204)
    },

    async newPassword(req: Request, res: Response) {
        const {password, recoveryCode} = req.body

        const result = await authService.newPassword(password, recoveryCode)

        if (result.statusCode === StatusesCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(400)
        }
    },
}