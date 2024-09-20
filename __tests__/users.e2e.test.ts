import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {codedAuth} from './helpers/datasets'
import {UserInputModel, UsersSortViewModel} from '../src/input-output-types/users-types';

describe('/users', () => {
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

    it('should create user, 201', async () => {
        const newUser: UserInputModel = {
            login: '123', //length 3
            password: '123456', //length 6
            email: '123@test.co'
        }

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser) // отправка данных
            .expect(201)

        expect(res.body.login).toEqual(newUser.login)
        expect(res.body.email).toEqual(newUser.email)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.login).toEqual('string')
        expect(typeof res.body.email).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')

        expect(await testHelpers.countUsersInDb()).toEqual(1)

        const newUser2: UserInputModel = {
            login: '1122334455', //length 10
            password: '11122233344455566677', //length 20
            email: '12345@test.cats'
        }

        const res2 = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser2)
            .expect(201)

        expect(res2.body.login).toEqual(newUser2.login)
        expect(res2.body.email).toEqual(newUser2.email)
        expect(typeof res2.body.id).toEqual('string')
        expect(typeof res2.body.login).toEqual('string')
        expect(typeof res2.body.email).toEqual('string')
        expect(typeof res2.body.createdAt).toEqual('string')

        expect(await testHelpers.countUsersInDb()).toEqual(2)
    })
    it('shouldn\'t create user, 401', async () => {
        const createdUser = await testHelpers.createOneUserInDb()

        const newUser: UserInputModel = {
            login: '12345',
            password: '123456',
            email: '12345@test.com'
        }

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .send(newUser)
            .expect(401)

        expect(await testHelpers.countUsersInDb()).toEqual(1)
    })
    it('shouldn\'t create user, 400', async () => {
        const createdUser = await testHelpers.createOneUserInDb()

        const newUser1: UserInputModel = {
            login: '12', //length 2
            password: '12345', //length 5
            email: '12@test.c'
        }


        const res1 = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser1)
            .expect(400)

        expect(res1.body.errorsMessages.length).toEqual(3)
        expect(res1.body.errorsMessages[0].field).toEqual('login')
        expect(res1.body.errorsMessages[1].field).toEqual('email')
        expect(res1.body.errorsMessages[2].field).toEqual('password')

        expect(await testHelpers.countUsersInDb()).toEqual(1)


        const newUser2: UserInputModel = {
            login: '12345678901', //length 11
            password: '111222333444555666777', //length 21
            email: '12test.com'
        }

        const res2 = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser2)
            .expect(400)

        expect(res2.body.errorsMessages.length).toEqual(3)
        expect(res2.body.errorsMessages[0].field).toEqual('login')
        expect(res2.body.errorsMessages[1].field).toEqual('email')
        expect(res2.body.errorsMessages[2].field).toEqual('password')

        expect(await testHelpers.countUsersInDb()).toEqual(1)
    })

    it('should get empty array, 200', async () => {
        const res = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(200)
        const expectedResult: UsersSortViewModel = {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        }
        expect(res.body).toEqual(expectedResult)
    })
    it('shouldn\'t get array, 401', async () => {
        const res = await req
            .get(SETTINGS.PATH.USERS)
            .expect(401)

        expect(await testHelpers.countUsersInDb()).toEqual(0)
    })
    it('should get not empty array, 200', async () => {
        const user1 = await testHelpers.createOneUserInDb('123')
        const user2 = await testHelpers.createOneUserInDb('123s4')
        const user3 = await testHelpers.createOneUserInDb('1s2345')
        const user4 = await testHelpers.createOneUserInDb('123456S')

        const query1 = {}

        const res1 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query1)
            .expect(200)

        const expectedResult1: UsersSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [user4, user3, user2, user1]
        }

        expect(res1.body).toEqual(expectedResult1)

        const query2 = {
            searchLoginTerm: '',
            sortBy: 'createdAt',
            sortDirection: 'asc',
            pageNumber: 2,
            pageSize: 1
        }

        const res2 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query2)
            .expect(200)

        const expectedResult2: UsersSortViewModel = {
            pagesCount: 4,
            page: 2,
            pageSize: 1,
            totalCount: 4,
            items: [user2]
        }

        expect(res2.body).toEqual(expectedResult2)

        const query3 = {
            searchLoginTerm: 'dsad',
            sortBy: 'createdAt',
            sortDirection: 'asc',
            pageNumber: 1,
            pageSize: 1
        }

        const res3 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query3)
            .expect(200)

        const expectedResult3: UsersSortViewModel = {
            pagesCount: 0,
            page: 1,
            pageSize: 1,
            totalCount: 0,
            items: []
        }

        expect(res3.body).toEqual(expectedResult3)

        const query4 = {
            searchLoginTerm: 's',
            sortBy: 'createdAt',
            sortDirection: '',
            pageNumber: 1,
            pageSize: 3
        }

        const res4 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query4)
            .expect(200)

        const expectedResult4: UsersSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 3,
            totalCount: 3,
            items: [user4, user3, user2]
        }

        expect(res4.body).toEqual(expectedResult4)

        const query4_2 = {
            searchEmailTerm: 's',
            sortBy: 'createdAt',
            sortDirection: '',
            pageNumber: 1,
            pageSize: 3
        }

        const res4_2 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query4_2)
            .expect(200)

        const expectedResult4_2: UsersSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 3,
            totalCount: 3,
            items: [user4, user3, user2]
        }

        expect(res4_2.body).toEqual(expectedResult4_2)

        const query5 = {
            searchLoginTerm: '',
            sortBy: '',
            sortDirection: '',
            pageNumber: 1,
            pageSize: 111
        }

        const res5 = await req
            .get(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .query(query5)
            .expect(200)

        const expectedResult5: UsersSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [user4, user3, user2, user1]
        }

        expect(res5.body).toEqual(expectedResult5)
    })

    it('should del, 204', async () => {
        const createdUser = await testHelpers.createOneUserInDb()

        expect(await testHelpers.countUsersInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.USERS + '/' + createdUser.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204)

        expect(await testHelpers.countBlogsInDb()).toEqual(0)
    })
    it('shouldn\'t del, 404', async () => {
        const createdUser = await testHelpers.createOneUserInDb()

        expect(await testHelpers.countUsersInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.USERS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404)

        expect(await testHelpers.countUsersInDb()).toEqual(1)
    })
    it('shouldn\'t del 401', async () => {
        const createdUser = await testHelpers.createOneUserInDb()

        expect(await testHelpers.countUsersInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.USERS + '/' + createdUser.id)
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401)

        expect(await testHelpers.countUsersInDb()).toEqual(1)
    })
})