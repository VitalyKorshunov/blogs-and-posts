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
        const isFind = async (login: string, email: string) => {
            const isLogin = await usersRepository.find('login', login)
            const isEmail = await usersRepository.find('email', email)


            const errors: Errors = {
                errorsMessages: []
            }

            if (isLogin) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
            if (isEmail) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

            return errors.errorsMessages.length ? errors : false
        }

        const isFound = await isFind(user.login, user.email)
        if (isFound) return isFound


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