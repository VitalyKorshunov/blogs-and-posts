import {usersRepository} from '../../users/repositories/usersRepository';
import {hashPassService} from '../../../common/adapters/hashPass.service';
import {
    EmailConfirmationType,
    PasswordUpdateWithRecoveryType,
    RecoveryPasswordType,
    UserId,
    UserInputModel,
    UserServiceModel
} from '../../../types/entities/users-types';
import {authRepository} from '../repositories/authRepository';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {UserDbType} from '../../../types/db/user-db-types';
import {v7 as uuidv7} from 'uuid';
import {add} from 'date-fns';
import {ErrorsType} from '../../../types/utils/output-errors-type';
import {AuthTokensType, EmailConfirmationCodeInputModel} from '../../../types/auth/auth-types';
import {nodemailerService} from '../../../common/adapters/nodemailer.service';
import {jwtService} from '../../../common/adapters/jwt.service';
import {PayloadRefreshTokenInputType, VerifyRefreshTokenViewModel} from '../../../types/auth/jwt-types';
import {
    DeviceId,
    DeviceName,
    IP,
    SecurityInputModel,
    SecurityServiceModel,
    SecuritySessionSearchQueryType,
    SecurityUpdateType
} from '../../../types/entities/security-types';

export const authService = {
    async _findUserByLoginOrEmail(loginOrEmail: string): Promise<UserServiceModel | null> {
        const field = loginOrEmail.includes('@') ? 'email' : 'login'

        return await usersRepository.findUserByFieldAndValue(field, loginOrEmail)
    },
    async _checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    },
    async _validateLoginAndEmail(login: string, email: string) {
        const errors: ErrorsType = {
            errorsMessages: []
        }
        const isLoginExist = await this._checkExistValueInField('login', login)
        const isEmailExist = await this._checkExistValueInField('email', email)
        if (isLoginExist) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
        if (isEmailExist) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

        return errors.errorsMessages.length ? errors : null
    },
    async _createAccessAndRefreshTokens(userId: UserId, deviceId: DeviceId): Promise<AuthTokensType | null> {
        const newAccessToken: string | null = await jwtService.createAccessToken(userId)
        const newRefreshToken: string | null = await jwtService.createRefreshToken(userId, deviceId)

        if (!newAccessToken || !newRefreshToken) {
            return null
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    },
    _unixTimestampToDate(unixTimestamp: number): Date {
        return new Date(unixTimestamp * 1000)

    },

    async loginUser(loginOrEmail: string, password: string, deviceName: DeviceName, ip: IP): Promise<ResultType<AuthTokensType>> {
        const user: UserServiceModel | null = await this._findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return result.invalidCredentials('user not found')
        }

        const isPasswordValid: boolean = await hashPassService.validatePassword(password, user.passHash)
        if (!isPasswordValid) {
            return result.invalidCredentials('password invalid')
        }

        const deviceId: DeviceId = uuidv7()
        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(user.id, deviceId)
        if (!tokens) {
            return result.tokenError('error create access or refresh tokens')
        }

        const refreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(tokens.refreshToken)
        if (!refreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const securitySessionData: SecurityInputModel = {
            deviceId,
            deviceName,
            ip,
            userId: user.id,
            lastActiveDate: this._unixTimestampToDate(refreshTokenPayload.iat),
            expireDate: this._unixTimestampToDate(refreshTokenPayload.exp),
        }

        const isSecuritySessionSet: boolean = await authRepository.setSecuritySessionData(securitySessionData)
        if (!isSecuritySessionSet) {
            return result.tokenError('failed to set security session data')
        }

        return result.success(tokens)
    },

    async logoutUser(refreshToken: string): Promise<ResultType<null>> {
        const refreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)
        if (!refreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const {deviceId, iat} = refreshTokenPayload
        const lastActiveDate: Date = this._unixTimestampToDate(iat)

        const isSecuritySessionDataDeleted: boolean = await authRepository.deleteSecuritySessionData(deviceId, lastActiveDate)
        if (!isSecuritySessionDataDeleted) {
            return result.tokenError('refresh token not updated')
        }

        return result.success(null)
    },

    async registrationUser({login, email, password}: UserInputModel): Promise<ResultType<null | ErrorsType>> {

        const loginOrEmailWithError = await this._validateLoginAndEmail(login, email)

        if (loginOrEmailWithError) {
            return result.loginOrEmailWithError('login or email not unique', loginOrEmailWithError)
        }

        const passHash = await hashPassService.generateHash(password)
        const newUser: UserDbType = {
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
        }
        const userId: UserId = await usersRepository.createUser(newUser)

        try {
            nodemailerService.sendEmailConfirmation(newUser.email, newUser.emailConfirmation.confirmationCode).catch(() => {
            })
        } catch (error) {
            console.error(error)
            await usersRepository.deleteUser(userId)

            return result.emailError('error nodemailer send email ')
        }

        return result.success(null)
    },

    async registrationConfirmationEmail(code: EmailConfirmationCodeInputModel): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'code error', field: 'code'}]}

        const isCodeConfirmationFound: boolean = await authRepository.isCodeConfirmationFound(code)

        if (!isCodeConfirmationFound) return result.notFound('code confirmation not found', error)

        const user: UserServiceModel | null = await authRepository.findUserByEmailConfirmationCode(code)

        if (!user) return result.notFound('user not found')
        if (user.emailConfirmation.isConfirmed) return result.emailError('email already confirmed', error)
        if (user.emailConfirmation.expirationDate < new Date()) return result.emailError('expired email code', error)

        const updateEmailConfirmation: EmailConfirmationType = {
            expirationDate: user.emailConfirmation.expirationDate,
            confirmationCode: '',
            isConfirmed: true
        }

        const isUpdatedEmailConfirmation: boolean = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        if (!isUpdatedEmailConfirmation) return result.emailError('email confirmation does not update')

        return result.success(null)
    },
    async resendRegistrationEmail(email: string): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'email not found', field: 'email'}]}

        const isEmailFound: boolean = await authRepository.isEmailFound(email)
        if (!isEmailFound) return result.emailError('email not found', error)

        const user: UserServiceModel | null = await authRepository.findUserByEmail(email)
        if (!user) return result.notFound('user not found')

        if (user.emailConfirmation.isConfirmed) return result.emailError('email already confirmed', error)

        const updateEmailConfirmation: EmailConfirmationType = {
            expirationDate: add(new Date(), {
                minutes: 10
            }),
            confirmationCode: uuidv7(),
            isConfirmed: false
        }

        const isUpdatedEmailConfirmation: boolean = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        if (!isUpdatedEmailConfirmation) return result.notFound('email confirmations not updated')

        try {
            nodemailerService.sendEmailConfirmation(email, updateEmailConfirmation.confirmationCode).catch(() => {
            })
        } catch (error) {
            console.error(error)
            return result.emailError('error nodemailer send email')
        }

        return result.success(null)
    },

    async updateTokens(refreshToken: string): Promise<ResultType<AuthTokensType>> {
        const oldRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!oldRefreshTokenPayload) {
            return result.tokenError('refresh token invalid')
        }

        const isUserFound: boolean = await authRepository.isUserFound(oldRefreshTokenPayload.userId)

        if (!isUserFound) {
            return result.notFound('user not found')
        }

        const {userId, deviceId}: PayloadRefreshTokenInputType = oldRefreshTokenPayload
        const lastActiveDate: Date = this._unixTimestampToDate(oldRefreshTokenPayload.iat)
        const securitySessionQuery: SecuritySessionSearchQueryType = {
            deviceId,
            lastActiveDate
        }

        const securitySession: SecurityServiceModel | null = await authRepository.getSecuritySession(securitySessionQuery)
        if (!securitySession) {
            return result.tokenError('session does not exist with current data')
        }

        if (oldRefreshTokenPayload.userId !== securitySession.userId) {
            return result.tokenError('userId does not match current user')
        }

        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(userId, deviceId)

        if (!tokens) {
            return result.tokenError('error create access or refresh tokens')
        }

        const newRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(tokens.refreshToken)
        if (!newRefreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const securitySessionUpdateData: SecurityUpdateType = {
            deviceId,
            lastActiveDate: this._unixTimestampToDate(newRefreshTokenPayload.iat),
            expireDate: this._unixTimestampToDate(newRefreshTokenPayload.exp),
        }

        const isSecuritySessionUpdated: boolean = await authRepository.updateSecuritySessionData(securitySessionQuery, securitySessionUpdateData)
        if (!isSecuritySessionUpdated) {
            return result.tokenError('failed to update security session data')
        }

        return result.success(tokens)
    },

    async passwordRecovery(email: any): Promise<ResultType<null>> {
        const user = await authRepository.findUserByEmail(email)
        console.log(user)
// console.log(email)
        if (!user) {
            return result.notFound('user with current email not found')
        }

        const recoveryPasswordData: RecoveryPasswordType = {
            expirationDate: add(new Date(), {
                minutes: 5
            }),
            recoveryCode: uuidv7()
        }
        console.log(recoveryPasswordData)
        try {
            nodemailerService.sendRecoveryPasswordCode(email, recoveryPasswordData.recoveryCode).catch((err) => console.log(err))
        } catch (err) {
            console.error(err)
            return result.emailError('error send recovery password')
        }

        const isUserPasswordRecoveryUpdate = await authRepository.updateUserRecoveryPassword(email, recoveryPasswordData)
        if (!isUserPasswordRecoveryUpdate) {
            return result.passwordError('error update recovery password')
        }

        return result.success(null)
    },
    async newPassword(newPassword: string, recoveryCode: string): Promise<ResultType<null>> {
        const user: UserServiceModel | null = await authRepository.findUserByRecoveryCode(recoveryCode)
        const user2 = await authRepository.findUserByEmail('vitaliy.korshunov1994@gmail.com')
        console.log(user2)
// console.log(recoveryCode)
        if (!user) {
            return result.notFound('user with current recovery code not found')
        }

        if (user.recoveryPassword.expirationDate < new Date()) {
            return result.passwordError('recovery code is expired')
        }
console.log(newPassword)
        const newPassHash = await hashPassService.generateHash(newPassword)
console.log(newPassHash)
        const updatePasswordWithRecoveryPassword: PasswordUpdateWithRecoveryType = {
            passHash: newPassHash,
            recoveryPassword: {
                expirationDate: new Date(),
                recoveryCode: ''
            }
        }

        const isPasswordWithRecoveryPasswordUpdated: boolean = await authRepository.updateUserPasswordWithRecoveryPassword(recoveryCode, updatePasswordWithRecoveryPassword)

        if (!isPasswordWithRecoveryPasswordUpdated) {
            return result.passwordError('password and recovery password does not updated')
        }

        return result.success(null)
    }
}