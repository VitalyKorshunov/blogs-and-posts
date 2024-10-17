import {UserId, UserInputModel} from '../../../types/entities/users-types';
import {usersRepository} from '../repositories/usersRepository';
import {hashPassService} from '../../../common/adapters/hashPass.service';
import {UserDbType} from '../../../types/db/user-db-types';
import {ErrorsType} from '../../../types/utils/output-errors-type';


export const usersService = {
    async _checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    },


    async create({login, email, password}: UserInputModel): Promise<UserId | ErrorsType> {
        const errors: ErrorsType = {
            errorsMessages: []
        }
        const isLoginExist = await this._checkExistValueInField('login', login)
        const isEmailExist = await this._checkExistValueInField('email', email)
        if (isLoginExist) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
        if (isEmailExist) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

        if (errors.errorsMessages.length) {
            return errors
        }

        const passHash = await hashPassService.generateHash(password)
        const newUser: UserDbType = {
            login,
            email,
            passHash,
            createdAt: new Date(),
            emailConfirmation: {
                expirationDate: new Date(),
                confirmationCode: '',
                isConfirmed: true
            }
        }

        return await usersRepository.createUser(newUser)
    },
    async deleteUser(id: UserId): Promise<number> {
        return usersRepository.deleteUser(id)
    },
}