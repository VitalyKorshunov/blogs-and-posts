import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../types/db/query-db-types';
import {UserId, UserServiceModel} from '../../types/entities/users-types';
import {UserDbType} from '../../types/db/user-db-types';
import {injectable} from 'inversify';
import {HydratedUserType, UserModel} from '../../domain/UsersEntity';

@injectable()
export class UsersRepository {
    private toIdQuery(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToUserServiceModel(user: WithId<UserDbType>): UserServiceModel {
        const {_id, ...rest} = user
        return {
            id: _id.toString(),
            ...rest
        }
    }

    async createUser(user: UserDbType): Promise<UserId> {
        const _id = await UserModel.insertMany([user])

        return _id[0]._id.toString()
    }

    async findUserByFieldAndValue(field: string, value: string): Promise<HydratedUserType | null> {
        const queryToDb = (
            (field === 'id')
                ? this.toIdQuery(value)
                : {[field]: value}
        )

        return UserModel.findOne(queryToDb)
    }

    async deleteUser(userId: UserId): Promise<number> {
        const user = await UserModel.deleteOne(this.toIdQuery(userId))

        return user.deletedCount
    }

    async save(userModel: HydratedUserType) {
        await userModel.save()
    }
}