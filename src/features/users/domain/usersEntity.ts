import mongoose, {HydratedDocument, Model} from 'mongoose';
import {EmailConfirmationType, RecoveryPasswordType} from '../../../types/entities/users-types';
import {UserDbType} from '../../../types/db/user-db-types';
import {SETTINGS} from '../../../settings';
import {add} from 'date-fns';
import {v7 as uuidv7} from 'uuid';

export interface UserMethodsType {
    canBeConfirmed(): boolean

    confirmEmail(confirmationCode: string): void

    isEmailConfirmed(): boolean

    changeEmailConfirmationCode(): void

    getEmailConfirmationCode(): string

    changePassRecoveryCode(): void

    isPassRecoveryCodeExpired(): boolean

    getPassRecoveryCode(): string

    changePassHash(passRecoveryCode: string, newPassHash: string): void

    getPassHash(): string

    getId(): string
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
userSchema.method('confirmEmail', function confirmEmail(confirmationCode: string) {
    if (!this.canBeConfirmed()) throw new Error(`email already confirmed or expired email code`)
    if (this.emailConfirmation.confirmationCode !== confirmationCode) throw new Error(`invalid email confirmation code`)

    this.emailConfirmation.isConfirmed = true
    this.emailConfirmation.expirationDate = new Date()
})
userSchema.method('isEmailConfirmed', function isEmailConfirmed() {
    const that = this as UserDbType & UserMethodsType

    return that.emailConfirmation.isConfirmed
})
userSchema.method('changeEmailConfirmationCode', function changeEmailConfirmationCode() {
    if (this.isEmailConfirmed()) throw new Error('email already confirm')

    const confirmationCode = uuidv7()

    this.emailConfirmation.expirationDate = add(new Date(), {
        minutes: 10
    })
    this.emailConfirmation.confirmationCode = confirmationCode
})
userSchema.method('getEmailConfirmationCode', function getEmailConfirmationCode(): string {
    return this.emailConfirmation.confirmationCode
})
userSchema.method('isPassRecoveryCodeExpired', function isPassRecoveryCodeExpired(): boolean {
    return this.recoveryPassword.expirationDate < new Date()
})
userSchema.method('changePassRecoveryCode', function changePassRecoveryCode() {
    this.recoveryPassword.expirationDate = add(new Date(), {minutes: 5})
    this.recoveryPassword.recoveryCode = uuidv7()
})
userSchema.method('getPassRecoveryCode', function getPassRecoveryCode(): string {
    return this.recoveryPassword.recoveryCode
})
userSchema.method('changePassHash', function changePassHash(passRecoveryCode: string, newPassHash: string): void {
    if (this.isPassRecoveryCodeExpired()) throw new Error('recovery code is expired')
    if (this.recoveryPassword.recoveryCode !== passRecoveryCode) throw new Error('invalid password recovery code')

    this.passHash = newPassHash
    this.recoveryPassword.expirationDate = new Date()
})

userSchema.method('getPassHash', function getPassHash(): string {
    return this.passHash
})
userSchema.method('getId', function getId(): string {
    return this.id
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