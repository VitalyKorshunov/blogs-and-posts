import {UserId, UserInputModel} from '../../../input-output-types/users-types';
import {UserDbType} from '../../../db/user-db-type';
import {ObjectId} from 'mongodb';
import {usersRepository} from '../repositories/usersRepository';
import bcrypt from 'bcrypt';

export type Errors = {
    errorsMessages: {
        field: string
        message: string
    }[]
}

export const usersService = {
    async create(user: UserInputModel): Promise<UserId | Errors> {
        const isLoginOrEmailExist = async (login: string, email: string) => {
            const errors: Errors = {
                errorsMessages: []
            }

            const isLoginExist = await usersRepository.findLoginOrEmail('login', login)
            const isEmailExist = await usersRepository.findLoginOrEmail('email', email)

            if (isLoginExist) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
            if (isEmailExist) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

            return errors.errorsMessages.length ? errors : false
        }

        const isFoundLoginOrEmail = await isLoginOrEmailExist(user.login, user.email)
        if (isFoundLoginOrEmail) return isFoundLoginOrEmail


        const passHash = await bcrypt.hash(user.password, 12)
        const newUser: UserDbType = {
            _id: new ObjectId(),
            login: user.login,
            email: user.email,
            passHash: passHash,
            createdAt: new Date().toISOString()
        }

        return await usersRepository.create(newUser)
    },
    async del(id: UserId): Promise<number> {
        return usersRepository.del(id)
    },
}