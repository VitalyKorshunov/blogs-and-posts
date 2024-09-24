import {AuthInputModel} from '../../../input-output-types/auth-types';
import {userCollection} from '../../../db/mongo-db';
import {UserDbType} from '../../../db/user-db-type';
import bcrypt from 'bcrypt';

export const authQueryRepository = {
    async authenticateUser(body: AuthInputModel): Promise<boolean> {
        const field = body.loginOrEmail.includes('@') ? 'email' : 'login'

        const user: UserDbType | null = await userCollection.findOne({[field]: body.loginOrEmail})

        if (user) {
            return await bcrypt.compare(body.password, user.passHash)
        }

        return false
    },

}