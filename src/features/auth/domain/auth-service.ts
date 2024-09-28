import {usersRepository} from '../../users/repositories/usersRepository';
import {UserOutputDbViewModel} from '../../../db/user-db-type';
import {hashPassService} from '../../../common/adapters/hashPassService';
import {jwtService} from '../../../common/adapters/jwt.service';

export const authService = {
    async _findUserByLoginOrEmail(loginOrEmail: string): Promise<UserOutputDbViewModel | null> {
        const field = loginOrEmail.includes('@') ? 'email' : 'login'

        return await usersRepository.findUserByFieldAndValue(field, loginOrEmail)
    },

    async loginUser(loginOrEmail: string, password: string): Promise<string | null> {
        const user = await this._findUserByLoginOrEmail(loginOrEmail)
        if (!user) return null

        const checkPassword: boolean = await hashPassService.checkPassword(password, user.passHash)
        if (!checkPassword) return null

        return jwtService.createToken(user.id)
    },
}