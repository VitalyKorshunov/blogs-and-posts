import {Request, Response} from 'express';
import {UserInputModel, UsersSortViewModel, UserViewModel} from '../../../types/entities/users-types';
import {ParamType} from '../../../types/request-response/request-types';
import {ErrorsType} from '../../../types/utils/output-errors-type';
import {UsersService} from '../domain/users-service';
import {UsersQueryRepository} from '../repositories/usersQueryRepository';
import {inject, injectable} from 'inversify';

@injectable()
export class UsersControllers {
    constructor(
        @inject(UsersService) protected usersService: UsersService,
        @inject(UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository
    ) {
    }

    async createUser(req: Request<any, any, UserInputModel>, res: Response<UserViewModel | ErrorsType>) {
        const {login, email, password}: UserInputModel = req.body
        const newUserId = await this.usersService.create({login, email, password})
        if (typeof newUserId === 'string') {
            const newUser = await this.usersQueryRepository.findAndMap(newUserId)
            res
                .status(201)
                .json(newUser)
        } else {
            res
                .status(400)
                .json(newUserId)
        }
    }

    async deleteUser(req: Request<ParamType>, res: Response) {
        await this.usersService.deleteUser(req.params.id)
        res
            .sendStatus(204)
    }

    async getUsers(req: Request, res: Response<UsersSortViewModel>) {
        const users = await this.usersQueryRepository.getAll(req.query);
        res
            .status(200)
            .json(users)
    }
}