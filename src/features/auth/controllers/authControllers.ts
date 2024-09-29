import {Request, Response} from 'express';
import {AuthInputModel} from '../../../types/auth/auth-types';
import {authService} from '../domain/auth-service';
import {authQueryRepository} from '../repositories/authQueryRepository';

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
    }
}