import {Request, Response} from 'express';
import {AuthInputModel, AuthTokensType} from '../../../types/auth/auth-types';
import {UserInputModel} from '../../../types/entities/users-types';
import {handleError, StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {DeviceName, IP} from '../../../types/entities/security-types';
import {AuthService} from '../application/authService';
import {AuthQueryRepository} from '../infrastructure/authQueryRepository';
import {inject, injectable} from 'inversify';

@injectable()
export class AuthControllers {
    constructor(
        @inject(AuthService) protected authService: AuthService,
        @inject(AuthQueryRepository) protected authQueryRepository: AuthQueryRepository
    ) {
    }

    async loginUser(req: Request<{}, {}, AuthInputModel>, res: Response) {
        const {loginOrEmail, password}: AuthInputModel = req.body
        const deviceName: DeviceName = req.headers['user-agent'] ?? 'anonymous device'
        const ip: IP = req.ip ?? 'ip not defined'

        const result = await this.authService.loginUser(loginOrEmail, password, deviceName, ip);

        if (result.statusCode === StatusCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = result.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            handleError(result, res)
        }
    }

    async logoutUser(req: Request, res: Response) {
        const result = await this.authService.logoutUser(req.cookies.refreshToken)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    }

    async getUserInfo(req: Request, res: Response) {
        const userInfo = await this.authQueryRepository.getUserById(req.user!.id)

        if (userInfo) {
            res.status(200).json(userInfo)
        } else {
            res.sendStatus(401)
        }
    }

    async registerUser(req: Request, res: Response) {
        const {login, email, password}: UserInputModel = req.body
        const result = await this.authService.registrationUser({login, email, password})

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    }

    async registrationConfirmationEmail(req: Request, res: Response) {
        const result = await this.authService.registrationConfirmationEmail(req.body.code)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    }

    async resendRegistrationEmail(req: Request, res: Response) {
        const result = await this.authService.resendRegistrationEmail(req.body.email)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            handleError(result, res)
        }
    }

    async updateTokens(req: Request, res: Response) {
        const {refreshToken} = req.cookies

        const result = await this.authService.updateTokens(refreshToken)

        if (result.statusCode === StatusCode.Success) {
            const {accessToken, refreshToken}: AuthTokensType = result.data

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true
            })
            res.status(200).json({accessToken: accessToken})
        } else {
            handleError(result, res)
        }
    }

    async passwordRecovery(req: Request, res: Response) {
        const {email} = req.body;

        await this.authService.passwordRecovery(email)

        res.sendStatus(204)
    }

    async newPassword(req: Request, res: Response) {
        const {newPassword, recoveryCode} = req.body

        const result = await this.authService.newPassword(newPassword, recoveryCode)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(400)
        }
    }
}