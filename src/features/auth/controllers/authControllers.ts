import {Request, Response} from 'express';
import {authQueryRepository} from '../repositories/authQueryRepository';
import {AuthInputModel} from '../../../input-output-types/auth-types';

export const authControllers = {
    async authenticateUser(req: Request<{}, {}, AuthInputModel>, res: Response) {
        const isAuthenticate = await authQueryRepository.authenticateUser(req.body);

        if (isAuthenticate) {
            res.sendStatus(204)
        } else {
            res.sendStatus(401)
        }
    },

}