import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {AuthInputModel} from '../src/input-output-types/auth-types';

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

    it('should correct auth, 204', async () => {
        await testHelpers.createOneUserInDb('123', '123456')

        const sendBody1: AuthInputModel = {
            loginOrEmail: '123',
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody1)
            .expect(204)

        const sendBody2: AuthInputModel = {
            loginOrEmail: '123@123.com',
            password: '123456'
        }
        await req
            .post(SETTINGS.PATH.AUTH + '/login')
            .send(sendBody2)
            .expect(204)
    })

    it('should incorrect auth, 400', async () => {
        await testHelpers.createOneUserInDb('123', '123456')

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
        await testHelpers.createOneUserInDb('123', '123456')

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
})