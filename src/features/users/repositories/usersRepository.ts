import {userCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-type';
import {UserId, UserServiceModel} from '../../../types/entities/users-types';
import {UserDbType} from '../../../types/db/user-db-type';

export const usersRepository = {
    _toIdQuery(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToUserServiceModel(user: WithId<UserDbType>): UserServiceModel {
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            passHash: user.passHash,
            createdAt: user.createdAt
        }
    },

    async create(user: UserDbType): Promise<UserId> {
        const _id = await userCollection.insertOne(user)

        return _id.insertedId.toString()
    },
    async findUserByFieldAndValue(field: string, value: string): Promise<UserServiceModel | null> {
        const queryToDb = (
            (field === 'id')
                ? this._toIdQuery(value)
                : {[field]: value}
        )

        const user: WithId<UserDbType> | null = await userCollection.findOne(queryToDb)
        return user ? this._mapToUserServiceModel(user) : null
    },
    async del(userId: UserId): Promise<number> {
        const user = await userCollection.deleteOne(this._toIdQuery(userId))

        return user.deletedCount
    },
}