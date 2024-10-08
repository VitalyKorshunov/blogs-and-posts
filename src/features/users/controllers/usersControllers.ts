import {Request, Response} from 'express';
import {usersService} from '../domain/users-service';
import {usersQueryRepository} from '../repositories/usersQueryRepository';
import {UserInputModel, UsersSortViewModel, UserViewModel} from '../../../types/entities/users-types';
import {ParamType} from '../../../types/request-response/request-types';
import {ErrorsType} from '../../../types/output-errors-type';

export const usersControllers = {
    async createUser(req: Request<any, any, UserInputModel>, res: Response<UserViewModel | ErrorsType>) {
        const {login, email, password}: UserInputModel = req.body
        const newUserId = await usersService.create({login, email, password})
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