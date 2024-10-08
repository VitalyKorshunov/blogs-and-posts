import {userCollection} from '../../../db/mongo-db';
import {EmailConfirmationCodeInputModel} from '../../../types/auth/auth-types';
import {EmailConfirmation, UserId, UserServiceModel} from '../../../types/entities/users-types';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserDbType} from '../../../types/db/user-db-types';


export const authRepository = {
    _toIdQuery(id: UserId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToUserServiceModel(user: WithId<UserDbType>): UserServiceModel {
        const {_id, ...rest} = user
        return {
            id: _id.toString(),
            ...rest
        }
    },

    async isUserFound(id: UserId): Promise<boolean> {
        const user: number = await userCollection.countDocuments(this._toIdQuery(id));

        return !!user
    },
    async isCodeConfirmationFound(code: EmailConfirmationCodeInputModel): Promise<boolean> {
        const isCodeFound: number = await userCollection.countDocuments({'emailConfirmation.confirmationCode': code});

        return !!isCodeFound
    },
    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await userCollection.findOne(this._toIdQuery(userId))

        return user ? this._mapToUserServiceModel(user) : null
    },
    async findUserByEmailConfirmationCode(code: EmailConfirmationCodeInputModel) {
        const user: WithId<UserDbType> | null = await userCollection.findOne({'emailConfirmation.confirmationCode': code});

        return user ? this._mapToUserServiceModel(user) : null
    },
    async updateUserEmailConfirmation(id: UserId, update: EmailConfirmation) {
        const isUserUpdated = await userCollection.updateOne(this._toIdQuery(id), {$set: {emailConfirmation: update}})

        return !!isUserUpdated.matchedCount
    },
    async isEmailFound(email: string): Promise<boolean> {
        const isEmailFound = await userCollection.countDocuments({email: email})

        return !!isEmailFound
    },
    async findUserByEmail(email: string) : Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await userCollection.findOne({email: email})

        return user ? this._mapToUserServiceModel(user) : null
    }
}