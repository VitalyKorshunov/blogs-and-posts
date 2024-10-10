import {usersRepository} from '../../users/repositories/usersRepository';
import {hashPassService} from '../../../common/adapters/hashPass.service';
import {EmailConfirmation, UserId, UserInputModel, UserServiceModel} from '../../../types/entities/users-types';
import {authRepository} from '../repositories/authRepository';
import {ExecutionStatus, StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
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

    async loginUser(loginOrEmail: string, password: string): Promise<ExecutionStatus> {
        const user = await this._findUserByLoginOrEmail(loginOrEmail)
        if (!user) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const isPasswordValid: boolean = await hashPassService.validatePassword(password, user.passHash)
        if (!isPasswordValid) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(user.id)
        if (!tokens) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(user.id, tokens.refreshToken)
        if (!isUserRefreshTokenUpdated) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        return new ExecutionStatus(StatusCode.Success, tokens)
    },

    async logoutUser(userId: UserId, refreshToken: string): Promise<ExecutionStatus> {
        const refreshTokenPayload: JwtVerifyViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!refreshTokenPayload) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const user: UserServiceModel | null = await authRepository.findUserById(userId)

        if (!user) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        if (user.refreshToken !== refreshToken || user.id !== refreshTokenPayload.id) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(userId, '')

        if (!isUserRefreshTokenUpdated) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        return new ExecutionStatus(StatusCode.Success)
    },

    async registrationUser({login, email, password}: UserInputModel): Promise<ExecutionStatus> {

        const loginOrEmailWithError = await this._validateLoginAndEmail(login, email)

        if (loginOrEmailWithError) return new ExecutionStatus(StatusCode.NotFound, loginOrEmailWithError)

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

        if (!user) return new ExecutionStatus(StatusCode.NotFound, {})

        try {
            await nodemailerService.sendEmailConfirmation(user.email, user.emailConfirmation.confirmationCode)
        } catch (error) {
            console.error(error)
            await usersRepository.deleteUser(user.id)

            return new ExecutionStatus(StatusCode.ErrorSendEmail)
        }

        return new ExecutionStatus(StatusCode.Success)
    },

    async verifyEmail(code: EmailConfirmationCodeInputModel): Promise<ExecutionStatus> {
        const error = {errorsMessages: [{message: 'code error', field: 'code'}]}

        const isCodeConfirmationFound = await authRepository.isCodeConfirmationFound(code)

        if (!isCodeConfirmationFound) return new ExecutionStatus(StatusCode.NotFound, error)

        const user: UserServiceModel | null = await authRepository.findUserByEmailConfirmationCode(code)

        if (!user) return new ExecutionStatus(StatusCode.NotFound)
        if (user.emailConfirmation.isConfirmed) return new ExecutionStatus(StatusCode.NotFound, error)
        if (user.emailConfirmation.expirationDate < new Date()) return new ExecutionStatus(StatusCode.BadRequest, error)

        const updateEmailConfirmation: EmailConfirmation = {
            expirationDate: user.emailConfirmation.expirationDate,
            confirmationCode: '',
            isConfirmed: true
        }

        const isUpdatedEmailConfirmation = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        return (isUpdatedEmailConfirmation) ? new ExecutionStatus(StatusCode.Success) : new ExecutionStatus(StatusCode.NotFound)
    },
    async resendRegistrationEmail(email: string): Promise<ExecutionStatus> {
        const error = {errorsMessages: [{message: 'email not found', field: 'email'}]}
        const isEmailFound = await authRepository.isEmailFound(email)

        if (!isEmailFound) return new ExecutionStatus(StatusCode.NotFound, error)

        const user: UserServiceModel | null = await authRepository.findUserByEmail(email)

        if (!user) return new ExecutionStatus(StatusCode.NotFound)
        if (user.emailConfirmation.isConfirmed) return new ExecutionStatus(StatusCode.BadRequest, error)

        const updateEmailConfirmation: EmailConfirmation = {
            expirationDate: add(new Date(), {
                minutes: 10
            }),
            confirmationCode: uuidv7(),
            isConfirmed: false
        }

        const isUpdatedEmailConfirmation = await authRepository.updateUserEmailConfirmation(user.id, updateEmailConfirmation)

        if (!isUpdatedEmailConfirmation) return new ExecutionStatus(StatusCode.NotFound)

        try {
            await nodemailerService.sendEmailConfirmation(email, updateEmailConfirmation.confirmationCode)
        } catch (error) {
            console.error(error)
            return new ExecutionStatus(StatusCode.ErrorSendEmail)
        }

        return new ExecutionStatus(StatusCode.Success)
    },

    async updateTokens(userId: UserId, refreshToken: string): Promise<ExecutionStatus> {
        const refreshTokenPayload: JwtVerifyViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!refreshTokenPayload) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const user: UserServiceModel | null = await authRepository.findUserById(userId)

        if (!user) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        if (user.refreshToken !== refreshToken || user.id !== refreshTokenPayload.id) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const tokens: AuthTokensType | null = await this._createAccessAndRefreshTokens(userId)

        if (!tokens) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        const isUserRefreshTokenUpdated: boolean = await authRepository.updateUserRefreshToken(userId, tokens.refreshToken)

        if (!isUserRefreshTokenUpdated) {
            return new ExecutionStatus(StatusCode.NotFound)
        }

        return new ExecutionStatus(StatusCode.Success, tokens)
    }
}