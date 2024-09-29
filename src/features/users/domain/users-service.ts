import {UserId, UserInputModel} from '../../../types/entities/users-types';
import {usersRepository} from '../repositories/usersRepository';
import {hashPassService} from '../../../common/adapters/hashPassService';
import {UserDbType} from '../../../types/db/user-db-type';

export type Errors = {
    errorsMessages: {
        field: string
        message: string
    }[]
}

export const usersService = {
    async _checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    },


    async create(user: UserInputModel): Promise<UserId | Errors> {
        const errors: Errors = {
            errorsMessages: []
        }
        const isLoginExist = await this._checkExistValueInField('login', user.login)
        const isEmailExist = await this._checkExistValueInField('email', user.email)
        if (isLoginExist) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
        if (isEmailExist) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

        if (errors.errorsMessages.length) {
            return errors
        }

        const passHash = await hashPassService.generateHash(user.password)
        const newUser: UserDbType = {
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