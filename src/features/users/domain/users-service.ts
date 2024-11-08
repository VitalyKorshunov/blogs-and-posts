import {UserId, UserInputModel} from '../../../types/entities/users-types';
import {hashPassService} from '../../../common/adapters/hashPass.service';
import {UserDbType} from '../../../types/db/user-db-types';
import {ErrorsType} from '../../../types/utils/output-errors-type';
import {UsersRepository} from '../repositories/usersRepository';

export class UsersService {
    private usersRepository: UsersRepository

    constructor() {
        this.usersRepository = new UsersRepository()
    }

    private async checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await this.usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    }

    async create({login, email, password}: UserInputModel): Promise<UserId | ErrorsType> {
        const errors: ErrorsType = {
            errorsMessages: []
        }
        const isLoginExist = await this.checkExistValueInField('login', login)
        const isEmailExist = await this.checkExistValueInField('email', email)
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
            recoveryPassword: {
                expirationDate: new Date(),
                recoveryCode: ''
            },
            emailConfirmation: {
                expirationDate: new Date(),
                confirmationCode: '',
                isConfirmed: true
            }
        }

        return await this.usersRepository.createUser(newUser)
    }

    async deleteUser(id: UserId): Promise<number> {
        return this.usersRepository.deleteUser(id)
    }
}