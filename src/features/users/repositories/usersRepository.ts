import {userCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';
import {UserId} from '../../../input-output-types/users-types';
import {UserDbInputType, UserDbType, UserOutputDbViewModel} from '../../../db/user-db-type';

export const usersRepository = {
    _getValidQueryId(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToUserViewModel(user: UserDbType) {
        const userForOutput: UserOutputDbViewModel = {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            passHash: user.passHash,
            createdAt: user.createdAt
        }
        return userForOutput
    },

    async create(user: UserDbInputType): Promise<UserId> {
        const _id = await userCollection.insertOne(user)

        return _id.insertedId.toString()
    },
    async findUserByFieldAndValue(field: string, value: string): Promise<UserOutputDbViewModel | null> {
        const queryToDb = (
            (field === 'id')
                ? this._getValidQueryId(value)
                : {[field]: value}
        )

        const user: UserDbType | null = await userCollection.findOne(queryToDb)
        return user ? this._mapToUserViewModel(user) : null
    },
    async del(userId: UserId): Promise<number> {
        const user = await userCollection.deleteOne(this._getValidQueryId(userId))

        return user.deletedCount
    },
}