import {hashPassService} from '../../../common/adapters/hashPass.service';
import {UserId, UserInputModel} from '../../../types/entities/users-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {v7 as uuidv7} from 'uuid';
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
    SecuritySessionSearchQueryType,
    SecurityUpdateType
} from '../../../types/entities/security-types';
import {AuthRepository} from '../infrastructure/authRepository';
import {UsersRepository} from '../../users/infrastructure/usersRepository';
import {inject} from 'inversify';
import {HydratedUserType, UserModel} from '../../users/domain/usersEntity';
import {HydratedSecurityType} from '../../security/domain/securityEntity';

export class AuthService {
    constructor(
        @inject(AuthRepository) protected authRepository: AuthRepository,
        @inject(UsersRepository) protected usersRepository: UsersRepository
    ) {
    }

    private async findUserByLoginOrEmail(loginOrEmail: string): Promise<HydratedUserType | null> {
        const field = loginOrEmail.includes('@') ? 'email' : 'login'

        return this.usersRepository.findUserByFieldAndValue(field, loginOrEmail)
    }

    private async checkExistValueInField(field: string, value: string): Promise<boolean> {
        const isExist = await this.usersRepository.findUserByFieldAndValue(field, value)

        return !!isExist
    }

    private async validateLoginAndEmail(login: string, email: string) {
        const errors: ErrorsType = {
            errorsMessages: []
        }
        const isLoginExist = await this.checkExistValueInField('login', login)
        const isEmailExist = await this.checkExistValueInField('email', email)
        if (isLoginExist) errors.errorsMessages.push({field: 'login', message: 'login should be unique'})
        if (isEmailExist) errors.errorsMessages.push({field: 'email', message: 'email should be unique'})

        return errors.errorsMessages.length ? errors : null
    }

    private async createAccessAndRefreshTokens(userId: UserId, deviceId: DeviceId): Promise<AuthTokensType | null> {
        const newAccessToken: string | null = await jwtService.createAccessToken(userId)
        const newRefreshToken: string | null = await jwtService.createRefreshToken(userId, deviceId)

        if (!newAccessToken || !newRefreshToken) {
            return null
        }

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    }

    private unixTimestampToDate(unixTimestamp: number): Date {
        return new Date(unixTimestamp * 1000)

    }

    async loginUser(loginOrEmail: string, password: string, deviceName: DeviceName, ip: IP): Promise<ResultType<AuthTokensType>> {
        const smartUser: HydratedUserType | null = await this.findUserByLoginOrEmail(loginOrEmail)
        if (!smartUser) {
            return result.invalidCredentials('user not found')
        }

        const isPasswordValid: boolean = await hashPassService.validatePassword(password, smartUser.getPassHash())
        if (!isPasswordValid) {
            return result.invalidCredentials('password invalid')
        }

        const deviceId: DeviceId = uuidv7()
        const tokens: AuthTokensType | null = await this.createAccessAndRefreshTokens(smartUser.getId(), deviceId)
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
            userId: smartUser.getId(),
            lastActiveDate: this.unixTimestampToDate(refreshTokenPayload.iat),
            expireDate: this.unixTimestampToDate(refreshTokenPayload.exp),
        }

        const isSecuritySessionSet: boolean = await this.authRepository.setSecuritySessionData(securitySessionData)
        if (!isSecuritySessionSet) {
            return result.tokenError('failed to set security session data')
        }

        return result.success(tokens)
    }

    async logoutUser(refreshToken: string): Promise<ResultType<null>> {
        const refreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)
        if (!refreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const {deviceId, iat} = refreshTokenPayload
        const lastActiveDate: Date = this.unixTimestampToDate(iat)

        const isSecuritySessionDataDeleted: boolean = await this.authRepository.deleteSecuritySessionData(deviceId, lastActiveDate)
        if (!isSecuritySessionDataDeleted) {
            return result.tokenError('refresh token not updated')
        }

        return result.success(null)
    }

    async registrationUser({login, email, password}: UserInputModel): Promise<ResultType<null | ErrorsType>> {

        const loginOrEmailWithError = await this.validateLoginAndEmail(login, email)

        if (loginOrEmailWithError) {
            return result.loginOrEmailWithError('login or email not unique', loginOrEmailWithError)
        }

        const passHash = await hashPassService.generateHash(password)

        const smartUser = UserModel.createUser(login, email, passHash)

        await this.authRepository.save(smartUser)

        nodemailerService.sendEmailConfirmation(smartUser.email, smartUser.emailConfirmation.confirmationCode).catch((e: Error) => console.log(e.message))

        return result.success(null)
    }

    async registrationConfirmationEmail(confirmationCode: EmailConfirmationCodeInputModel): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'code not found', field: 'code'}]}

        const isCodeConfirmationFound: boolean = await this.authRepository.isCodeConfirmationFound(confirmationCode)

        if (!isCodeConfirmationFound) return result.notFound('code confirmation not found', error)

        const smartUser = await this.authRepository.findUserByEmailConfirmationCode(confirmationCode)

        if (!smartUser) return result.notFound('user not found')

        if (!smartUser.canBeConfirmed()) return result.emailError('email already confirmed or expired email code', error)

        smartUser.confirmEmail(confirmationCode)

        await this.authRepository.save(smartUser)

        return result.success(null)
    }

    async resendRegistrationEmail(email: string): Promise<ResultType<null | ErrorsType>> {
        const error = {errorsMessages: [{message: 'email not found', field: 'email'}]}

        const isEmailFound: boolean = await this.authRepository.isEmailFound(email)
        if (!isEmailFound) return result.emailError('email not found', error)

        const smartUser = await this.authRepository.findUserByEmail(email)
        if (!smartUser) return result.notFound('user not found')

        if (smartUser.isEmailConfirmed()) return result.emailError('email already confirmed', error)

        smartUser.changeEmailConfirmationCode()

        await this.authRepository.save(smartUser)

        nodemailerService.sendEmailConfirmation(email, smartUser.getEmailConfirmationCode()).catch((e: Error) => console.log(e.message))

        return result.success(null)
    }

    async updateTokens(refreshToken: string): Promise<ResultType<AuthTokensType>> {
        const oldRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(refreshToken)

        if (!oldRefreshTokenPayload) {
            return result.tokenError('refresh token invalid')
        }

        const isUserFound: boolean = await this.authRepository.isUserFound(oldRefreshTokenPayload.userId)

        if (!isUserFound) {
            return result.notFound('user not found')
        }

        const {userId, deviceId}: PayloadRefreshTokenInputType = oldRefreshTokenPayload
        const lastActiveDate: Date = this.unixTimestampToDate(oldRefreshTokenPayload.iat)
        const securitySessionQuery: SecuritySessionSearchQueryType = {
            deviceId,
            lastActiveDate
        }

        const securitySession: HydratedSecurityType | null = await this.authRepository.getSecuritySession(securitySessionQuery)
        if (!securitySession) {
            return result.tokenError('session does not exist with current data')
        }

        if (oldRefreshTokenPayload.userId !== securitySession.userId.toString()) {
            return result.tokenError('userId does not match current user')
        }

        const tokens: AuthTokensType | null = await this.createAccessAndRefreshTokens(userId, deviceId)

        if (!tokens) {
            return result.tokenError('error create access or refresh tokens')
        }

        const newRefreshTokenPayload: VerifyRefreshTokenViewModel | null = await jwtService.verifyRefreshToken(tokens.refreshToken)
        if (!newRefreshTokenPayload) {
            return result.tokenError('error verify refresh token')
        }

        const securitySessionUpdateData: SecurityUpdateType = {
            deviceId,
            lastActiveDate: this.unixTimestampToDate(newRefreshTokenPayload.iat),
            expireDate: this.unixTimestampToDate(newRefreshTokenPayload.exp),
        }

        const isSecuritySessionUpdated: boolean = await this.authRepository.updateSecuritySessionData(securitySessionQuery, securitySessionUpdateData)
        if (!isSecuritySessionUpdated) {
            return result.tokenError('failed to update security session data')
        }

        return result.success(tokens)
    }

    async passwordRecovery(email: any): Promise<ResultType<null>> {
        const smartUser: HydratedUserType | null = await this.authRepository.findUserByEmail(email)

        if (!smartUser) {
            return result.notFound('user with current email not found')
        }

        smartUser.changePassRecoveryCode()

        nodemailerService.sendRecoveryPasswordCode(email, smartUser.getPassRecoveryCode()).catch((e: Error) => console.log(e.message))

        return result.success(null)
    }

    async newPassword(newPassword: string, passRecoveryCode: string): Promise<ResultType<null>> {
        const smartUser = await this.authRepository.findUserByRecoveryCode(passRecoveryCode)

        if (!smartUser) {
            return result.notFound('user with current recovery code not found')
        }

        if (smartUser.isPassRecoveryCodeExpired()) {
            return result.passwordError('recovery code is expired')
        }

        const newPassHash = await hashPassService.generateHash(newPassword)

        smartUser.changePassHash(passRecoveryCode, newPassHash)

        await this.authRepository.save(smartUser)

        return result.success(null)
    }
}