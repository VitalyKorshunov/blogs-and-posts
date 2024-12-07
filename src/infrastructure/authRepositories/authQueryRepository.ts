import {UserInfoViewModel} from '../../types/auth/auth-types';
import {UserDbType} from '../../types/db/user-db-types';
import {UserId} from '../../types/entities/users-types';
import {ObjectId, WithId} from 'mongodb';

import {UserModel} from '../../domain/UsersEntity';

export class AuthQueryRepository {
    private mapToUserInfoModel(user: WithId<UserDbType>) {
        const userInfo: UserInfoViewModel = {
            email: user.email,
            login: user.login,
            userId: user._id.toString()
        }
        return userInfo
    }

    async getUserById(id: UserId): Promise<UserInfoViewModel | null> {
        const user = await UserModel.findOne({_id: new ObjectId(id)})
        return user ? this.mapToUserInfoModel(user) : null
    }
}

