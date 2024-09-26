import {userCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';
import {UserId} from '../../../input-output-types/users-types';
import {UserDbType} from '../../../db/user-db-type';

export const usersRepository = {
    _getValidQueryId(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },

    async create(user: UserDbType): Promise<UserId> {
        const _id = await userCollection.insertOne(user)

        return _id.insertedId.toString()
    },

    async del(userId: UserId): Promise<number> {
        const user = await userCollection.deleteOne(this._getValidQueryId(userId))

        return user.deletedCount
    },
    async findLoginOrEmail(field: string, value: string): Promise<Object | null> {
        return await userCollection.findOne({[field]: value})
    },
}