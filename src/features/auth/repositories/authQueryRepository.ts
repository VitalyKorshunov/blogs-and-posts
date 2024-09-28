import {UserInfoViewModel} from '../../../input-output-types/auth-types';
import {UserDbType} from '../../../db/user-db-type';
import {UserId} from '../../../input-output-types/users-types';
import {userCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';

export const authQueryRepository = {
    _mapToUserInfoModel(user: UserDbType) {
        const userInfo: UserInfoViewModel = {
            email: user.email,
            login: user.login,
            userId: user._id.toString()
        }
        return userInfo
    },

    async getUserById(id: UserId): Promise<UserInfoViewModel | null> {
        const user = await userCollection.findOne({_id: new ObjectId(id)})
        return user ? this._mapToUserInfoModel(user) : null
    }
}