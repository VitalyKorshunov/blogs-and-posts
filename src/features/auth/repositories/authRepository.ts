import {securityCollection, UserModel} from '../../../db/mongo-db';
import {EmailConfirmationCodeInputModel} from '../../../types/auth/auth-types';
import {
    EmailConfirmationType,
    PasswordUpdateWithRecoveryType,
    RecoveryPasswordType,
    UserId,
    UserServiceModel
} from '../../../types/entities/users-types';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserDbType} from '../../../types/db/user-db-types';
import {
    DeviceId,
    SecurityInputModel,
    SecurityServiceModel,
    SecuritySessionSearchQueryType,
    SecurityUpdateType
} from '../../../types/entities/security-types';
import {SecurityDbType} from '../../../types/db/security-db-types';


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
    _mapToSecuritySessionServiceModel(securitySession: WithId<SecurityDbType>): SecurityServiceModel {
        const {_id, userId, ...rest} = securitySession

        return {
            id: _id.toString(),
            userId: userId.toString(),
            ...rest
        }
    },

    async isUserFound(id: UserId): Promise<boolean> {
        const user: number = await UserModel.countDocuments(this._toIdQuery(id));

        return !!user
    },
    async isCodeConfirmationFound(code: EmailConfirmationCodeInputModel): Promise<boolean> {
        const isCodeFound: number = await UserModel.countDocuments({'emailConfirmation.confirmationCode': code});

        return !!isCodeFound
    },
    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne(this._toIdQuery(userId)).lean()

        return user ? this._mapToUserServiceModel(user) : null
    },
    async findUserByEmailConfirmationCode(code: EmailConfirmationCodeInputModel) {
        const user: WithId<UserDbType> | null = await UserModel.findOne({'emailConfirmation.confirmationCode': code}).lean();

        return user ? this._mapToUserServiceModel(user) : null
    },
    async updateUserEmailConfirmation(id: UserId, update: EmailConfirmationType): Promise<boolean> {
        const isUserUpdated = await UserModel.updateOne(this._toIdQuery(id), {$set: {emailConfirmation: update}})

        return !!isUserUpdated.matchedCount
    },
    async isEmailFound(email: string): Promise<boolean> {
        const isEmailFound = await UserModel.countDocuments({email: email})

        return !!isEmailFound
    },
    async findUserByEmail(email: string): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne({email: email}).lean()

        return user ? this._mapToUserServiceModel(user) : null
    },
    async setSecuritySessionData(sessionData: SecurityInputModel): Promise<boolean> {
        const {userId, ...rest} = sessionData
        const mappedSessionData: SecurityDbType = {
            userId: new ObjectId(userId),
            ...rest
        }

        const isSecuritySessionSet = await securityCollection.insertOne(mappedSessionData)

        return !!isSecuritySessionSet.insertedId
    },
    async getSecuritySession(securitySessionQuery : SecuritySessionSearchQueryType): Promise<SecurityServiceModel | null> {
        const securitySession: WithId<SecurityDbType> | null = await securityCollection.findOne(securitySessionQuery)

        return securitySession ? this._mapToSecuritySessionServiceModel(securitySession) : null
    },
    async deleteSecuritySessionData(deviceId: DeviceId, lastActiveDate: Date): Promise<boolean> {
        const result = await securityCollection.deleteOne({deviceId, lastActiveDate})

        return !!result.deletedCount
    },
    async updateSecuritySessionData(securitySessionQuery : SecuritySessionSearchQueryType, securitySessionUpdateData: SecurityUpdateType): Promise<boolean> {
        const result = await securityCollection.updateOne(securitySessionQuery, {$set: securitySessionUpdateData})

        return !!result.matchedCount
    },

    async updateUserRecoveryPassword(email: string, recoveryPassword: RecoveryPasswordType): Promise <boolean> {
        const isRecoveryPasswordUpdate = await UserModel.updateOne({email}, {$set: {recoveryPassword: recoveryPassword}})

        return !!isRecoveryPasswordUpdate.matchedCount
    },

    async findUserByRecoveryCode(recoveryCode: string): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne({'recoveryPassword.recoveryCode': recoveryCode}).lean()

        return user ? this._mapToUserServiceModel(user) : null
    },


    async updateUserPasswordWithRecoveryPassword(recoveryCode: string, updatePasswordWithRecoveryPassword: PasswordUpdateWithRecoveryType): Promise<boolean> {
        const isUserUpdated = await UserModel.updateOne({'recoveryPassword.recoveryCode': recoveryCode}, {$set: updatePasswordWithRecoveryPassword})

        return !!isUserUpdated.matchedCount
    }
}