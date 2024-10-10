import {Request, Response} from 'express';
import {AuthInputModel, AuthTokensType} from '../../../types/auth/auth-types';
import {authService} from '../domain/auth-service';
import {authQueryRepository} from '../repositories/authQueryRepository';
import {UserInputModel} from '../../../types/entities/users-types';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';

export const authControllers = {
    async loginUser(req: Request<{}, {}, AuthInputModel>, res: Response) {
        const {loginOrEmail, password}: AuthInputModel = req.body

        const status = await authService.loginUser(loginOrEmail, password);

        if (status.statusCode === StatusCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = status.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            res.sendStatus(401)
        }
    },

    async logoutUser(req: Request, res: Response) {
        const status = await authService.logoutUser(req.user!.id, req.cookies.refreshToken)

        if (status.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
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
        const status = await authService.registrationUser({login, email, password})

        if (status.statusCode === StatusCode.ErrorSendEmail) {
            res.sendStatus(400)
        }
        if (status.statusCode === StatusCode.NotFound) {
            res.status(400).json(status.data)
        }
        if (status.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        }
    },

    async verifyEmail(req: Request, res: Response) {
        const status = await authService.verifyEmail(req.body.code)

        if (status.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.status(400).json(status.data)
        }
    },

    async resendRegistrationEmail(req: Request, res: Response) {
        const status = await authService.resendRegistrationEmail(req.body.email)

        if (status.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.status(400).json(status.data)
        }
    },

    async updateTokens(req: Request, res: Response) {
        const status = await authService.updateTokens(req.user!.id, req.cookies.refreshToken)

        if (status.statusCode === StatusCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = status.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            res.sendStatus(401)
        }
    },
}