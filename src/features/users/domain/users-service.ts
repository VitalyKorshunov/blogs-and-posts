import {UserId, UserInputModel} from '../../../input-output-types/users-types';
import {UserDbType} from '../../../db/user-db-type';
import {ObjectId} from 'mongodb';
import {usersRepository} from '../repositories/usersRepository';


export const usersService = {
    async create(user: UserInputModel): Promise<UserId> {

        const newUser: UserDbType = {
            _id: new ObjectId(),
            login: user.login,
            email: user.email,
            passHash: user.password,
            createdAt: new Date().toISOString()
        }

        return await usersRepository.create(newUser)
    },
    async del(id: UserId): Promise<number> {
        return usersRepository.del(id)
    },
}