import {Request, Response} from 'express';
import {AuthInputModel} from '../../../types/auth/auth-types';
import {authService} from '../domain/auth-service';
import {authQueryRepository} from '../repositories/authQueryRepository';
import {UserInputModel} from '../../../types/entities/users-types';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';

export const authControllers = {
    async authenticateUser(req: Request<{}, {}, AuthInputModel>, res: Response) {
        const accessToken = await authService.loginUser(req.body.loginOrEmail, req.body.password);

        if (accessToken) {
            res.status(200).json({accessToken: accessToken})
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
        } else if (status.statusCode === StatusCode.NotFound) {
            res.status(400).json(status.data)
        } else {
            res.sendStatus(400)
        }
    }
}