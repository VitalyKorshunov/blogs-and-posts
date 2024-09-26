import {Request, Response} from 'express';
import {Errors, usersService} from '../domain/users-service';
import {ParamType} from '../../blogs/some';
import {usersQueryRepository} from '../repositories/usersQueryRepository';
import {UserInputModel, UsersSortViewModel, UserViewModel} from '../../../input-output-types/users-types';

export const usersControllers = {
    async createUser(req: Request<any, any, UserInputModel>, res: Response<UserViewModel | Errors>) {
        const newUserId = await usersService.create(req.body)
        if (typeof newUserId === 'string') {
            const newUser = await usersQueryRepository.findAndMap(newUserId)
            res
                .status(201)
                .json(newUser)
        } else {
            res
                .status(400)
                .json(newUserId)
        }
    },

    async delUser(req: Request<ParamType>, res: Response) {
        await usersService.del(req.params.id)
        res
            .sendStatus(204)
    },

    async getUsers(req: Request, res: Response<UsersSortViewModel>) {
        const users = await usersQueryRepository.getAll(req.query);
        res
            .status(200)
            .json(users)
    },
}