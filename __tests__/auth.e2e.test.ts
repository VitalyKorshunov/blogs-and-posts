import {EmailWithConfirmationCodeType, req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {AuthInputModel} from '../src/types/auth/auth-types';
import {routersPaths} from '../src/common/path/paths';
import {UserInputModel} from '../src/types/entities/users-types';
import {UserDbType} from '../src/types/db/user-db-types';
import {ObjectId, WithId} from 'mongodb';
import {jwtService} from '../src/application/adapters/jwt.service';
import ms = require('ms');

describe('/auth', () => {
    beforeAll(async () => {
        await testHelpers.connectToDbForTests()
        testHelpers.mock.nodemailerService.sendEmailConfirmation()
    })
    beforeEach(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.deleteAllData()
    })
    afterAll(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.deleteAllData()
        await testHelpers.closeConnectToDbForTests()
    })


    it('post[/auth/registration] should be correct registration user, 204', async () => {
        function testFields(user: WithId<UserDbType>, registrationData: UserInputModel) {
            expect(user._id).toBeInstanceOf(ObjectId)
            expect(user.login).toEqual(registrationData.login)
            expect(typeof user.passHash).toBe('string')
            expect(user.email).toEqual(registrationData.email)
            expect(user.createdAt).toBeInstanceOf(Date)
            expect(user.recoveryPassword.expirationDate).toBeInstanceOf(Date)
            expect(user.recoveryPassword.recoveryCode).toEqual('')
            expect(user.emailConfirmation.expirationDate).toBeInstanceOf(Date)
            expect((user.emailConfirmation.confirmationCode).length).toBe(36)
            expect(user.emailConfirmation.isConfirmed).toBe(false)

            expect(Object.keys(user).length).toBe(7)
            expect(Object.keys(user.recoveryPassword).length).toBe(2)
            expect(Object.keys(user.emailConfirmation).length).toBe(3)
        }

        const registrationData1: UserInputModel = {
            login: testHelpers.generateString(3, '1'),
            password: testHelpers.generateString(6),
            email: 'test1@gmail.com'
        }

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData1)
            .expect(204)

        const user1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)
        expect(await testHelpers.countUsersInDb()).toBe(1)
        testFields(user1, registrationData1)

        // test2
        const registrationData2: UserInputModel = {
            login: testHelpers.generateString(10, '2'),
            password: testHelpers.generateString(20),
            email: 'test2@gmail.com'
        }
        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData2)
            .expect(204)

        const user2 = await testHelpers.findAndMapUserByIndex(1)
        expect(await testHelpers.countUsersInDb()).toBe(2)
        testFields(user2, registrationData2)
    })
    it('post[/auth/registration] shouldn\'t be registration user with incorrect or already exist user, 400', async () => {
        function testFields(user: WithId<UserDbType>, registrationData: UserInputModel) {
            expect(user._id).toBeInstanceOf(ObjectId)
            expect(user.login).toEqual(registrationData.login)
            expect(typeof user.passHash).toBe('string')
            expect(user.email).toEqual(registrationData.email)
            expect(user.createdAt).toBeInstanceOf(Date)
            expect(user.recoveryPassword.expirationDate).toBeInstanceOf(Date)
            expect(user.recoveryPassword.recoveryCode).toEqual('')
            expect(user.emailConfirmation.expirationDate).toBeInstanceOf(Date)
            expect((user.emailConfirmation.confirmationCode).length).toBe(36)
            expect(user.emailConfirmation.isConfirmed).toBe(false)

            expect(Object.keys(user).length).toBe(7)
            expect(Object.keys(user.recoveryPassword).length).toBe(2)
            expect(Object.keys(user.emailConfirmation).length).toBe(3)
        }

        const registrationData1: UserInputModel = {
            login: testHelpers.generateString(3, '1'),
            password: testHelpers.generateString(6),
            email: 'test1@gmail.com'
        }

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData1)
            .expect(204)

        const user1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)
        expect(await testHelpers.countUsersInDb()).toBe(1)
        testFields(user1, registrationData1)

        //test2
        const res2 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData1)
            .expect(400)

        expect(await testHelpers.countUsersInDb()).toBe(1)
        expect(res2.body.errorsMessages.length).toBe(2)
        expect(res2.body.errorsMessages[0].field).toBe('login')
        expect(res2.body.errorsMessages[1].field).toBe('email')

        // test3
        const registrationData3: UserInputModel = {
            login: testHelpers.generateString(2, '2'),
            password: testHelpers.generateString(5),
            email: 'test2gmail.com'
        }
        const res3 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData3)
            .expect(400)

        expect(await testHelpers.countUsersInDb()).toBe(1)
        expect(res3.body.errorsMessages.length).toBe(3)
        expect(res3.body.errorsMessages[0].field).toBe('login')
        expect(res3.body.errorsMessages[1].field).toBe('email')
        expect(res3.body.errorsMessages[2].field).toBe('password')

        // test4
        const registrationData4: UserInputModel = {
            login: testHelpers.generateString(11, '2'),
            password: testHelpers.generateString(21),
            email: 'test2@gmailcom'
        }
        const res4 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData4)
            .expect(400)

        expect(await testHelpers.countUsersInDb()).toBe(1)
        expect(res4.body.errorsMessages.length).toBe(3)
        expect(res4.body.errorsMessages[0].field).toBe('login')
        expect(res4.body.errorsMessages[1].field).toBe('email')
        expect(res4.body.errorsMessages[2].field).toBe('password')

        // test5
        const registrationData5 = {}

        const res5 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(registrationData5)
            .expect(400)

        expect(await testHelpers.countUsersInDb()).toBe(1)
        expect(res5.body.errorsMessages.length).toBe(3)
        expect(res5.body.errorsMessages[0].field).toBe('login')
        expect(res5.body.errorsMessages[1].field).toBe('email')
        expect(res5.body.errorsMessages[2].field).toBe('password')
    })
    it('post[/auth/registration] shouldn\'t be registration user with correct or incorrect data after 5 tries within 10 seconds, 429', async () => {
        await testHelpers.createMultiplyUsersWithUnconfirmedEmail(5)
        expect(await testHelpers.countUsersInDb()).toBe(5)

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send({})
            .expect(429)

        expect(await testHelpers.countUsersInDb()).toBe(5)
    })

    it('post[/auth/registration-confirmation] should correct verify user, 204', async () => {
        const userEmailWithEmailConfirmationCode: EmailWithConfirmationCodeType = await testHelpers.createUserByUser()

        const registrationConfirmationData = {
            code: userEmailWithEmailConfirmationCode.code
        }

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationConfirmation)
            .send(registrationConfirmationData)
            .expect(204)

        const user: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(user.emailConfirmation.confirmationCode).toBe('')
        expect(user.emailConfirmation.isConfirmed).toBe(true)
    })
    it('post[/auth/registration-confirmation] shouldn\'t verify user with incorrect data, 400', async () => {
        const userEmailWithEmailConfirmationCode: EmailWithConfirmationCodeType = await testHelpers.createUserByUser()

        const registrationConfirmationData1 = {
            code: userEmailWithEmailConfirmationCode.code + '1'
        }

        const res1 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationConfirmation)
            .send(registrationConfirmationData1)
            .expect(400)

        const userTest1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userTest1.emailConfirmation.confirmationCode).toBe(userEmailWithEmailConfirmationCode.code)
        expect(userTest1.emailConfirmation.isConfirmed).toBe(false)
        expect(res1.body.errorsMessages.length).toBe(1)
        expect(res1.body.errorsMessages[0].field).toBe('code')

        const registrationConfirmationData2 = {
            code: userEmailWithEmailConfirmationCode.code.slice(1) + 'x'
        }

        const res2 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationConfirmation)
            .send(registrationConfirmationData2)
            .expect(400)

        const userTest2: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userTest2.emailConfirmation.confirmationCode).toBe(userEmailWithEmailConfirmationCode.code)
        expect(userTest2.emailConfirmation.isConfirmed).toBe(false)
        expect(res2.body.errorsMessages.length).toBe(1)
        expect(res2.body.errorsMessages[0].field).toBe('code')
    })
    it('post[/auth/registration-confirmation] shouldn\'t verify user with correct or incorrect data after 5 tries within 10 seconds, 429', async () => {
        await testHelpers.createMultiplyUsersWithConfirmedEmail(5)

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationConfirmation)
            .send({})
            .expect(429)
    })

    it('post[/auth/registration-email-resending] should be input data accepted, 204', async () => {
        const emailAndCode: EmailWithConfirmationCodeType = await testHelpers.createUserByUser('user1', 'user1@gmail.com')
        const userFromBd1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userFromBd1.emailConfirmation.confirmationCode).toBe(emailAndCode.code)
        expect(userFromBd1.emailConfirmation.isConfirmed).toBe(false)

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationEmailResending)
            .send({email: emailAndCode.email})
            .expect(204)

        const userFromBd2: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userFromBd2.emailConfirmation.confirmationCode).not.toBe(emailAndCode.code)
        expect(userFromBd2.emailConfirmation.isConfirmed).toBe(false)

        await testHelpers.confirmRegistrationByCode(userFromBd2.emailConfirmation.confirmationCode)
    })
    it('post[/auth/registration-email-resending] shouldn\'t be input data accepted, 400', async () => {
        const emailAndCode: EmailWithConfirmationCodeType = await testHelpers.createUserByUser('user1', 'user1@gmail.com')
        const userFromBd1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userFromBd1.emailConfirmation.confirmationCode).toBe(emailAndCode.code)
        expect(userFromBd1.emailConfirmation.isConfirmed).toBe(false)

        const res = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationEmailResending)
            .send({email: emailAndCode.email + 'x'})
            .expect(400)

        expect(res.body.errorsMessages.length).toBe(1)
        expect(res.body.errorsMessages[0].field).toBe('email')

        const userFromBd2: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userFromBd2.emailConfirmation.confirmationCode).toBe(emailAndCode.code)
        expect(userFromBd2.emailConfirmation.isConfirmed).toBe(false)

        await testHelpers.confirmRegistrationByCode(userFromBd2.emailConfirmation.confirmationCode)
    })
    it('post[/auth/registration-email-resending] shouldn\'t be input data accepted after 5 tries within 10 second, 429', async () => {
        const emailAndCode: EmailWithConfirmationCodeType = await testHelpers.createUserByUser('user1', 'user1@gmail.com')
        const userFromBd1: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        expect(userFromBd1.emailConfirmation.confirmationCode).toBe(emailAndCode.code)
        expect(userFromBd1.emailConfirmation.isConfirmed).toBe(false)

        for (let i = 1; i <= 5; i++) {
            await req
                .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationEmailResending)
                .send({email: emailAndCode.email})
                .expect(204)
        }

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationEmailResending)
            .send({email: emailAndCode.email})
            .expect(429)

    })

    it('post[/auth/login] should be access login or email and get accessToken in body and refreshToken in cookie, 200', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1: EmailWithConfirmationCodeType = users[0]
        const userFromBd: WithId<UserDbType> = await testHelpers.findAndMapUserByIndex(0)

        const loginData: AuthInputModel = {
            loginOrEmail: user1.email,
            password: '123456'
        }

        const loginData2: AuthInputModel = {
            loginOrEmail: user1.email.split('@')[0],
            password: '123456'
        }
        //test by email
        await testIt(loginData, userFromBd)
        //test by login
        await testIt(loginData2, userFromBd)

        async function testIt(loginData: AuthInputModel, userFromBd: WithId<UserDbType>) {
            const res = await req
                .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
                .send(loginData)
                .expect(200)

            const {accessToken} = res.body
            expect(typeof accessToken).toBe('string')
            const payloadAccessToken = await jwtService.verifyAccessToken(accessToken)
            if (!payloadAccessToken) {
                fail('payload accessToken is null')
            }
            expect(Object.keys(payloadAccessToken).length).toBe(3)
            expect((payloadAccessToken.exp - payloadAccessToken.iat) * 1000).toBe(ms(SETTINGS.AT_LIFE_TIME))
            expect(payloadAccessToken.userId).toBe(userFromBd._id.toString())

            const refreshToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1]
            expect(typeof refreshToken).toBe('string')
            const payloadRefreshToken = await jwtService.verifyRefreshToken(refreshToken)
            if (!payloadRefreshToken) {
                fail('payload refreshToken is null')
            }
            expect(Object.keys(payloadRefreshToken).length).toBe(4)
            expect((payloadRefreshToken.exp - payloadRefreshToken.iat) * 1000).toBe(ms(SETTINGS.RT_LIFE_TIME))
            expect(payloadRefreshToken.userId).toBe(userFromBd._id.toString())
            expect(payloadRefreshToken.deviceId).toBeDefined()
        }
    })
    it('post[/auth/login] shouldn\'t be access with incorrect data, 400', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1: EmailWithConfirmationCodeType = users[0]

        const loginData: AuthInputModel = {
            loginOrEmail: user1.email + '@',
            password: '12345' //too short
        }
        const res = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .send(loginData)
            .expect(400)

        tests(res.body)

        const loginData2: AuthInputModel = {
            loginOrEmail: 'ab',
            password: testHelpers.generateString(21) //too long
        }
        const res2 = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .send(loginData2)
            .expect(400)

        tests(res2.body)

        function tests(body: any) {
            expect(body.errorsMessages.length).toBe(2)
            expect(body.errorsMessages[0].field).toBe('loginOrEmail')
            expect(body.errorsMessages[1].field).toBe('password')
        }
    })
    it('post[/auth/login] shouldn\'t be access with invalid login or password, 401', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1: EmailWithConfirmationCodeType = users[0]

        const loginData: AuthInputModel = {
            loginOrEmail: '123',
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .send(loginData)
            .expect(401)

        const loginData2: AuthInputModel = {
            loginOrEmail: user1.email,
            password: 'invalid'
        }
        const res = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .send(loginData2)
            .expect(401)
    })
    it('post[/auth/login] shouldn\'t be access witch valid data after 5 tries within 10 seconds, 429', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1: EmailWithConfirmationCodeType = users[0]

        // with invalid data
        for (let i = 1; i <= 5; i++) {
            const loginData: AuthInputModel = {
                loginOrEmail: 'invalid',
                password: 'invalid'
            }
            await req
                .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
                .send(loginData)
                .expect(401)
        }

        // with correct data but 6 tries and status 429
        const loginData: AuthInputModel = {
            loginOrEmail: user1.email,
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .send(loginData)
            .expect(429)
    })



    it('should return info about user, 200', async () => {
        await testHelpers.createUserByAdmin()
    })

})