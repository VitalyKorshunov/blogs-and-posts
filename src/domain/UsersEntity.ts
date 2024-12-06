import mongoose, {HydratedDocument, Model} from 'mongoose';
import {EmailConfirmationType, RecoveryPasswordType} from '../types/entities/users-types';
import {UserDbType} from '../types/db/user-db-types';
import {SETTINGS} from '../settings';
import {add} from 'date-fns';
import {v7 as uuidv7} from 'uuid';

export interface UserMethodsType {
    canBeConfirmed(): boolean
    confirm(): void
    isEmailConfirmed(): boolean
    generateNewEmailConfirmationCode(): void
    isRecoveryCodeExpired(): boolean
}

export type HydratedUserType = HydratedDocument<UserDbType, UserMethodsType>

export interface UserModelType extends Model<UserDbType, {}, UserMethodsType> {
    createUser(login: string, email: string, passHash: string): HydratedUserType
}

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>({
    expirationDate: {type: Date, required: true},
    confirmationCode: {type: String},
    isConfirmed: {type: Boolean, required: true}
}, {_id: false})

const recoveryPasswordSchema = new mongoose.Schema<RecoveryPasswordType>({
    expirationDate: {type: Date, required: true},
    recoveryCode: {type: String}
}, {_id: false})

const userSchema = new mongoose.Schema<UserDbType, UserModelType, UserMethodsType>({
    login: {type: String, required: true},
    email: {type: String, required: true},
    passHash: {type: String, required: true},
    createdAt: {type: Date, required: true},
    recoveryPassword: recoveryPasswordSchema,
    emailConfirmation: emailConfirmationSchema
})
userSchema.method('canBeConfirmed', function canBeConfirmed() {
    const that = this as UserDbType

    return that.emailConfirmation.isConfirmed === false
        && that.emailConfirmation.expirationDate > new Date()
})
userSchema.method('confirm', function confirm() {
    const that = this as UserDbType & UserMethodsType

    if (!that.canBeConfirmed()) throw new Error(`email already confirmed or expired email code`)

    that.emailConfirmation.isConfirmed = true
    that.emailConfirmation.confirmationCode = ''
})
userSchema.method('isEmailConfirmed', function isEmailConfirmed() {
    const that = this as UserDbType & UserMethodsType

    return that.emailConfirmation.isConfirmed
})
userSchema.method('generateNewEmailConfirmationCode', function generateNewEmailConfirmationCode() {
    if (this.isEmailConfirmed()) throw new Error('email already confirm')

    this.emailConfirmation.expirationDate = add(new Date(), {
        minutes: 10
    })
    this.emailConfirmation.confirmationCode = uuidv7()
})
userSchema.method('isRecoveryCodeExpired', function isRecoveryCodeExpired(){

})

userSchema.static('createUser', function createUser(login: string, email: string, passHash: string) {
    return new UserModel({
        login,
        email,
        passHash,
        createdAt: new Date(),
        recoveryPassword: {
            expirationDate: new Date(),
            recoveryCode: '',
        },
        emailConfirmation: {
            expirationDate: add(new Date(), {
                minutes: 10,
            }),
            confirmationCode: uuidv7(),
            isConfirmed: false
        }
    })
})

export const UserModel = mongoose.model<UserDbType, UserModelType>(SETTINGS.DB.USER_COLLECTION_NAME, userSchema)