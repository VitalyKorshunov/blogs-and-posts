import {usersRepository} from '../../users/repositories/usersRepository';
import {hashPassService} from '../../../common/adapters/hashPass.service';
import {EmailConfirmation, UserId, UserInputModel, UserServiceModel} from '../../../types/entities/users-types';
import {authRepository} from '../repositories/authRepository';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {UserDbType} from '../../../types/db/user-db-types';
import {v7 as uuidv7} from 'uuid';
import {add} from 'date-fns';
import {ErrorsType} from '../../../types/output-errors-type';
import {AuthTokensType, EmailConfirmationCodeInputModel} from '../../../types/auth/auth-types';
import {nodemailerService} from '../../../common/adapters/nodemailer.service';
import {jwtService} from '../../../common/adapters/jwt.service';
import {JwtVerifyViewModel} from '../../../types/auth/jwt-types';

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
    async _createAccessAndRefreshTokens(userId: UserId): Promise<AuthTokensType | null> {
        const newAccessToken: string | null = await jwtService.createAccessToken(userId)
        const newRefreshToken: string | null = await jwtService.createRefreshToken(userId)

        if (!newAccessToken || !newRefreshToken) {
            return null
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    },

    async loginUser(loginOrEmail: string, password: string): Promise<ResultType<AuthTokensType>> {
        const user: UserServiceModel | null = await this._findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return result.invalidCredentials('user not found')
        }

        const isPasswordValid: boolean = await hashPassService.validatePassword(password, user.passHash)
        if (!isPasswordValid) {
            return result.invalidCredentials('password invalid')
        }

        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(user.id)
        if (!tokens) {
            return result.tokenError('error create access or refresh tokens')
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(user.id, tokens.refreshToken)
        if (!isUserRefreshTokenUpdated) {
            return result.tokenError('error update refresh token')
        }

        return result.success(tokens)
    },

    async logoutUser(userId: UserId, refreshToken: string): Promise<ResultType<null>> {
        const refreshTokenPayload: JwtVerifyViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!refreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const user: UserServiceModel | null = await authRepository.findUserById(userId)

        if (!user) {
            return result.notFound('user not found')
        }

        if (user.refreshToken !== refreshToken || user.id !== refreshTokenPayload.id) {
            return result.tokenError('refresh token does not exist in user')
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(userId, '')

        if (!isUserRefreshTokenUpdated) {
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
            refreshToken: '',
            emailConfirmation: {
                expirationDate: add(new Date(), {
                    minutes: 10,
                }),
                confirmationCode: uuidv7(),
                isConfirmed: false
            }
        }
        const userId: UserId = await usersRepository.createUser(newUser)

        const user: UserServiceModel | null = await authRepository.findUserById(userId)

        if (!user) return result.notFound('user not found')

        try {
            await nodemailerService.sendEmailConfirmation(user.email, user.emailConfirmation.confirmationCode)
        } catch (error) {
            console.error(error)
            await usersRepository.deleteUser(user.id)

            return result.emailError('error nodemailer send email ')
        }

        return result.success(null)
    },

    async verifyEmail(code: EmailConfirmationCodeInputModel): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'code error', field: 'code'}]}

        const isCodeConfirmationFound = await authRepository.isCodeConfirmationFound(code)

        if (!isCodeConfirmationFound) return result.notFound('code confirmation not found', error)

        const user: UserServiceModel | null = await authRepository.findUserByEmailConfirmationCode(code)

        if (!user) return result.notFound('user not found')
        if (user.emailConfirmation.isConfirmed) return result.emailError('email already confirmed', error)
        if (user.emailConfirmation.expirationDate < new Date()) return result.emailError('expired email code', error)

        const updateEmailConfirmation: EmailConfirmation = {
            expirationDate: user.emailConfirmation.expirationDate,
            confirmationCode: '',
            isConfirmed: true
        }

        const isUpdatedEmailConfirmation = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        if (!isUpdatedEmailConfirmation) return result.emailError('email confirmation does not update')

        return result.success(null)
    },
    async resendRegistrationEmail(email: string): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'email not found', field: 'email'}]}

        const isEmailFound = await authRepository.isEmailFound(email)
        if (!isEmailFound) return result.emailError('email not found', error)

        const user: UserServiceModel | null = await authRepository.findUserByEmail(email)
        if (!user) return result.notFound('user not found')

        if (user.emailConfirmation.isConfirmed) return result.emailError('email already confirmed', error)

        const updateEmailConfirmation: EmailConfirmation = {
            expirationDate: add(new Date(), {
                minutes: 10
            }),
            confirmationCode: uuidv7(),
            isConfirmed: false
        }

        const isUpdatedEmailConfirmation = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        if (!isUpdatedEmailConfirmation) return result.notFound('email confirmations not updated')

        try {
            await nodemailerService.sendEmailConfirmation(email, updateEmailConfirmation.confirmationCode)
        } catch (error) {
            console.error(error)
            return result.emailError('error nodemailer send email')
        }

        return result.success(null)
    },

    async updateTokens(userId: UserId, refreshToken: string): Promise<ResultType<AuthTokensType>> {
        const refreshTokenPayload: JwtVerifyViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!refreshTokenPayload) {
            return result.tokenError('refresh token invalid')
        }

        const user: UserServiceModel | null = await authRepository.findUserById(userId)

        if (!user) {
            return result.notFound('user not found')
        }

        if (user.refreshToken !== refreshToken || user.id !== refreshTokenPayload.id) {
            return result.tokenError('refresh token does not exist in user')
        }

        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(userId)

        if (!tokens) {
            return result.tokenError('error create access or refresh tokens')
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(userId, tokens.refreshToken)

        if (!isUserRefreshTokenUpdated) {
            return result.tokenError('error update refresh token')
        }

        return result.success(tokens)
    }
}