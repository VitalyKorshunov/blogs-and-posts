import mongoose, {Model} from 'mongoose';
import {EmailConfirmationType, RecoveryPasswordType} from '../types/entities/users-types';
import {UserDbType} from '../types/db/user-db-types';
import {SETTINGS} from '../settings';

type UserDBMethodsType = {
    canBeConfirmed: () => boolean
    confirm: () => void
}
type UserModelType = Model<UserDbType, {}, UserDBMethodsType>

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>({
    expirationDate: {type: Date, required: true},
    confirmationCode: {type: String},
    isConfirmed: {type: Boolean, required: true}
}, {_id: false})

const recoveryPasswordSchema = new mongoose.Schema<RecoveryPasswordType>({
    expirationDate: {type: Date, required: true},
    recoveryCode: {type: String}
}, {_id: false})

const userSchema = new mongoose.Schema<UserDbType, UserModelType, UserDBMethodsType>({
    login: {type: String, required: true},
    email: {type: String, required: true},
    passHash: {type: String, required: true},
    createdAt: {type: Date, required: true},
    recoveryPassword: recoveryPasswordSchema,
    emailConfirmation: emailConfirmationSchema
})

userSchema.method('canBeConfirmed', function canBeConfirmed() {
    const that = this as UserDbType

    return that.emailConfirmation.isConfirmed && that.emailConfirmation.expirationDate < new Date()
})

userSchema.method('confirm', function confirm() {
    const that = this as UserDbType & UserDBMethodsType

    if (!that.canBeConfirmed()) throw new Error(`email already confirmed or expired email code`)

    this.emailConfirmation.isConfirmed = true
})

export const UserModel = mongoose.model<UserDbType, UserModelType>(SETTINGS.DB.USER_COLLECTION_NAME, userSchema)