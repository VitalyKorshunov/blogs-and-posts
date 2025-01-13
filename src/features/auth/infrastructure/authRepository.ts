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
    SecuritySessionSearchQueryType,
    SecurityUpdateType
} from '../../../types/entities/security-types';
import {SecurityDbType} from '../../../types/db/security-db-types';
import {HydratedUserType, UserModel} from '../../users/domain/usersEntity';
import {HydratedSecurityType, SecurityModel} from '../../security/domain/securityEntity';


export class AuthRepository {
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

    async isUserFound(id: UserId): Promise<boolean> {
        const user: number = await UserModel.countDocuments(this.toIdQuery(id));

        return !!user
    }

    async save(userModel: HydratedUserType) {
        await userModel.save()
    }

    async isCodeConfirmationFound(code: EmailConfirmationCodeInputModel): Promise<boolean> {
        const isCodeFound: number = await UserModel.countDocuments({'emailConfirmation.confirmationCode': code});

        return !!isCodeFound
    }

    async findUserById(userId: UserId): Promise<UserServiceModel | null> {
        const user: WithId<UserDbType> | null = await UserModel.findOne(this.toIdQuery(userId)).lean()

        return user ? this.mapToUserServiceModel(user) : null
    }

    async findUserByEmailConfirmationCode(code: EmailConfirmationCodeInputModel) {
        return UserModel.findOne({'emailConfirmation.confirmationCode': code});
    }

    async updateUserEmailConfirmation(id: UserId, update: EmailConfirmationType): Promise<boolean> {
        const isUserUpdated = await UserModel.updateOne(this.toIdQuery(id), {$set: {emailConfirmation: update}})

        return !!isUserUpdated.matchedCount
    }

    async isEmailFound(email: string): Promise<boolean> {
        const isEmailFound = await UserModel.countDocuments({email: email})

        return !!isEmailFound
    }

    async findUserByEmail(email: string): Promise<HydratedUserType | null> {
        return UserModel.findOne({email: email});
    }

    async setSecuritySessionData(sessionData: SecurityInputModel): Promise<boolean> {
        const {userId, ...rest} = sessionData
        const mappedSessionData: SecurityDbType = {
            userId: new ObjectId(userId),
            ...rest
        }

        const isSecuritySessionSet = await SecurityModel.insertMany([mappedSessionData])

        return !!isSecuritySessionSet[0]._id
    }

    async getSecuritySession(securitySessionQuery: SecuritySessionSearchQueryType): Promise<HydratedSecurityType | null> {
        return SecurityModel.findOne(securitySessionQuery)
   }

    async deleteSecuritySessionData(deviceId: DeviceId, lastActiveDate: Date): Promise<boolean> {
        const result = await SecurityModel.deleteOne({deviceId, lastActiveDate})

        return !!result.deletedCount
    }

    async updateSecuritySessionData(securitySessionQuery: SecuritySessionSearchQueryType, securitySessionUpdateData: SecurityUpdateType): Promise<boolean> {
        const result = await SecurityModel.updateOne(securitySessionQuery, {$set: securitySessionUpdateData})

        return !!result.matchedCount
    }

    async updateUserRecoveryPassword(email: string, recoveryPassword: RecoveryPasswordType): Promise<boolean> {
        const isRecoveryPasswordUpdate = await UserModel.updateOne({email}, {$set: {recoveryPassword: recoveryPassword}})

        return !!isRecoveryPasswordUpdate.matchedCount
    }

    async findUserByRecoveryCode(recoveryCode: string): Promise<HydratedUserType | null> {
        return UserModel.findOne({'recoveryPassword.recoveryCode': recoveryCode})
    }

    async updateUserPasswordWithRecoveryPassword(recoveryCode: string, updatePasswordWithRecoveryPassword: PasswordUpdateWithRecoveryType): Promise<boolean> {
        const isUserUpdated = await UserModel.updateOne({'recoveryPassword.recoveryCode': recoveryCode}, {$set: updatePasswordWithRecoveryPassword})

        return !!isUserUpdated.matchedCount
    }
}