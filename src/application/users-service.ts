import {UserId, UserInputModel} from '../types/entities/users-types';
import {hashPassService} from './adapters/hashPass.service';
import {ErrorsType} from '../types/utils/output-errors-type';
import {UsersRepository} from '../infrastructure/userRepositories/usersRepository';
import {inject, injectable} from 'inversify';
import {UserModel} from '../domain/UsersEntity';

@injectable()
export class UsersService {
    constructor(
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {
    }

    private async checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await this.usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    }

    async createUserByAdmin({login, email, password}: UserInputModel): Promise<UserId | ErrorsType> {
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

        const smartUser = UserModel.createUser(login, email, passHash)

        smartUser.confirmEmail(smartUser.getEmailConfirmationCode())

        await this.usersRepository.save(smartUser)

        return smartUser.getId()
    }

    async deleteUser(id: UserId): Promise<number> {
        return this.usersRepository.deleteUser(id)
    }
}