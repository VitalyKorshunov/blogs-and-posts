import {Request, Response} from 'express';
import {usersService} from '../domain/users-service';
import {ParamType} from '../../blogs/some';
import {usersQueryRepository} from '../repositories/usersQueryRepository';
import {UserInputModel, UsersSortViewModel, UserViewModel} from '../../../input-output-types/users-types';

export const usersControllers = {
    async createUser(req: Request<any, any, UserInputModel>, res: Response<UserViewModel>) {
        const newUserId = await usersService.create(req.body)
        const newUser = await usersQueryRepository.findAndMap(newUserId)
        res
            .status(201)
            .json(newUser)
    },

    async delPost(req: Request<ParamType>, res: Response) {
        await usersService.del(req.params.id)
        res
            .sendStatus(204)
    },

    async getPosts(req: Request, res: Response<UsersSortViewModel>) {
        const users = await usersQueryRepository.getAll(req.query);
        res
            .status(200)
            .json(users)
    },
}