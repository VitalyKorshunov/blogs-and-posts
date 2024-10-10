import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {AuthInputModel} from '../src/types/auth/auth-types';
import {jwtService} from '../src/common/adapters/jwt.service';
import ms from 'ms'
import {differenceInMilliseconds} from 'date-fns';

describe('/auth', () => {
    beforeAll(async () => {
        await testHelpers.connectToDbForTests()
    })
    beforeEach(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.deleteAllData()
    })
    afterAll(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.deleteAllData()
        await testHelpers.closeConnectToDbForTests()
    })

    it('should correct auth/login, 204', async () => {
        await testHelpers.createUserInDb('123', '123456')

        const sendBody1: AuthInputModel = {
            loginOrEmail: '123',
            password: '123456'
        }
        const res1 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody1)
            .expect(200)

        const jwtExpirationDate = res1.headers['set-cookie'][0].split('; ')[3].split('=')[1]
        const resCurrDate = new Date(res1.headers['date'])
console.log(res1.xhr)
expect(differenceInMilliseconds(jwtExpirationDate, resCurrDate)).toBe(ms(SETTINGS.RT_LIFE_TIME))
        const payloadRes1 = await jwtService.verifyAccessToken(res1.body.accessToken)
        expect(payloadRes1).not.toEqual(null)


        const sendBody2: AuthInputModel = {
            loginOrEmail: '123@gmail.com',
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody2)
            .expect(200)
    })
    it('should incorrect auth, 400', async () => {
        await testHelpers.createUserInDb('123', '123456')

        const sendBody1: AuthInputModel = {
            loginOrEmail: '11',
            password: '12345'
        }

        const res1 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody1)
            .expect(400)

        expect(res1.body.errorsMessages[0].field).toEqual('loginOrEmail')
        expect(res1.body.errorsMessages[1].field).toEqual('password')

        const sendBody2: AuthInputModel = {
            loginOrEmail: '12345678901',
            password: '123451234512345123451'
        }

        const res2 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody2)
            .expect(400)

        expect(res2.body.errorsMessages[0].field).toEqual('loginOrEmail')
        expect(res2.body.errorsMessages[1].field).toEqual('password')


        const sendBody3: AuthInputModel = {
            loginOrEmail: '123@.ru',
            password: '12345123451234512345'
        }

        const res3 = await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody3)
            .expect(400)

        expect(res3.body.errorsMessages[0].field).toEqual('loginOrEmail')
    })
    it('should incorrect login or password , 401', async () => {
        await testHelpers.createUserInDb('123', '123456')

        const sendBody1: AuthInputModel = {
            loginOrEmail: '123',
            password: '1234567'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody1)
            .expect(401)


        const sendBody2: AuthInputModel = {
            loginOrEmail: '123@red.com',
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody2)
            .expect(401)


        const sendBody3: AuthInputModel = {
            loginOrEmail: '12345',
            password: '12345678'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody3)
            .expect(401)
    })

    it('should return info about user, 200', async () => {
        await testHelpers.createUserInDb()
    })

})