import {req, testHelpers} from './helpers/test-helpers';
import {AuthTokensType} from '../src/types/auth/auth-types';
import {SETTINGS} from '../src/settings';
import {routersPaths} from '../src/common/path/paths';
import {SecurityViewModel} from '../src/types/entities/security-types';

describe('/securityDevices', () => {
    beforeAll(async () => {
        await testHelpers.connectToDbForTests()
        testHelpers.mock.nodemailerService.sendEmailConfirmation()
    })
    beforeEach(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.deleteAllData()
    })
    afterAll(async () => { // очистка базы данных после тестирования и закрытие соединения
        await testHelpers.deleteAllData()
        await testHelpers.closeConnectToDbForTests()
    })


    it('get[/security/devices] should be get all devices for user, 200', async () => {
        // 1. create user, login 4 times with different user-agent and get sessions
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1 = users[0]
        const userTokensDevice1: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent1')
        const userTokensDevice2: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent2')
        const userTokensDevice3: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent3')
        const userTokensDevice4: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent4')

        const res1 = await req
            .get(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + userTokensDevice1.refreshToken})
            .expect(200)

        expect(Object.keys(res1.body).length).toBe(4)

        const resultRes1: SecurityViewModel[] = res1.body
        const resultForIndex0: SecurityViewModel = res1.body[0]
        expect(resultForIndex0.ip).toBeDefined()
        expect(resultForIndex0.deviceId).toBeDefined()
        expect(resultForIndex0.title).toBeDefined()
        expect(resultForIndex0.lastActiveDate).toBeDefined()


        // 2. update refreshToken for device1
        const updatedTokensDevice1 = await testHelpers.updateTokensForUser(userTokensDevice1.refreshToken)

        // 3. get sessions by refresh token device1. LastActiveDate will be updated, but other should remain as is
        const res2 = await testHelpers.getUserSessionsByRefreshToken(updatedTokensDevice1.refreshToken)

        expect(resultRes1.length).toBe(res2.length)

        expect(resultRes1[0].deviceId).toEqual(res2[0].deviceId)
        expect(resultRes1[0].title).toEqual(res2[0].title)
        expect(resultRes1[0].lastActiveDate).not.toEqual(res2[0].lastActiveDate)

        expect(resultRes1[1]).toEqual(res2[1])
        expect(resultRes1[2]).toEqual(res2[2])
        expect(resultRes1[3]).toEqual(res2[3])

        // 4. Delete device2 by updatedRefreshTokenDevice1. Get sessions. Device2 shouldn't exist
        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + res2[1].deviceId)
            .set({'Cookie': 'refreshToken=' + updatedTokensDevice1.refreshToken})
            .expect(204)

        const res3 = await testHelpers.getUserSessionsByRefreshToken(updatedTokensDevice1.refreshToken)

        expect(res3.length).toBe(3)
        expect(res3).not.toContainEqual(res2[1])

        // 5. logout for device3. Get sessions. Device3 shouldn't exist
        await testHelpers.logoutUserByRefreshToken(userTokensDevice3.refreshToken)

        const res4 = await testHelpers.getUserSessionsByRefreshToken(updatedTokensDevice1.refreshToken)

        expect(res4.length).toBe(2)
        expect(res4).not.toContainEqual(res2[2])

        // 6. logout for device4. Get sessions. Device4 shouldn't exist
        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + updatedTokensDevice1.refreshToken})
            .expect(204)

        const res5 = await testHelpers.getUserSessionsByRefreshToken(updatedTokensDevice1.refreshToken)

        expect(res5.length).toBe(1)
        expect(res5).not.toContainEqual(res2[3])
    })


    it('get[/security/devices] shouldn\'t be get all devices for user, 401 [Unauthorized]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1 = users[0]
        const userTokensDevice1: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent1')
        const userTokensDevice2: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent2')

        const res = await req
            .get(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + userTokensDevice1.refreshToken + 'invalid'})
            .expect(401)

        expect(res.body).toEqual({})
    })

    it('get[/security/devices] shouldn\'t be get all devices by refreshToken deleted session, 401 [Unauthorized]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1 = users[0]
        const userTokensDevice1: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent1')
        const userTokensDevice2: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent2')
        const userTokensDevice3: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent3')

        const devices: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(userTokensDevice3.refreshToken)
        await testHelpers.deleteUserSessionByDeviceId(devices[2].deviceId, userTokensDevice3.refreshToken)

        await req
            .get(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + userTokensDevice3.refreshToken})
            .expect(401)

    })

    it('delete[/security/devices/{deviceId}] should be delete device2 and get device1, 204 [No Content]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1 = users[0]
        const userTokensDevice1: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent1')
        const userTokensDevice2: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent2')

        const devices: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(userTokensDevice1.refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + devices[1].deviceId)
            .set({'Cookie': 'refreshToken=' + userTokensDevice1.refreshToken})
            .expect(204)

        const devices2: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(userTokensDevice1.refreshToken)
        expect(devices2.length).toBe(1)
    })

    it('delete[/security/devices/{deviceId}] shouldn\'t be delete device2 and get device1 and device2, 401 [Unauthorized]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const user1 = users[0]
        const userTokensDevice1: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent1')
        const userTokensDevice2: AuthTokensType = await testHelpers.loginUserAndGetTokens(user1.login, user1.password, 'agent2')

        const devices1: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(userTokensDevice1.refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + devices1[1].deviceId)
            .set({'Cookie': 'refreshToken=' + userTokensDevice1.refreshToken + 'invalid'})
            .expect(401)

        const devices2: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(userTokensDevice1.refreshToken)

        expect(devices2).toEqual(devices1)
    })

    it('delete[/security/devices/{deviceId}] shouldn\'t be delete device user1 by user2, 403 [Forbidden]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(2)
        const authorizedUsers = await testHelpers.loginMultiplyUsersAndGetTokens(users, 2)

        const user1 = authorizedUsers[0]
        const user2 = authorizedUsers[1]

        const user1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + user1Devices[0].deviceId)
            .set({'Cookie': 'refreshToken=' + user2.tokens[0].refreshToken})
            .expect(403)

        const updatedUser1Devices: SecurityViewModel[] = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        expect(updatedUser1Devices).toEqual(user1Devices)
    })

    it('delete[/security/devices/{deviceId}] shouldn\'t be find non-existent deviceId, 404 [No Found]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const authorizedUsers = await testHelpers.loginMultiplyUsersAndGetTokens(users, 2)

        const user1 = authorizedUsers[0]

        const user1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        await testHelpers.deleteUserSessionByDeviceId(user1Devices[1].deviceId, user1.tokens[0].refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + user1Devices[1].deviceId)
            .set({'Cookie': 'refreshToken=' + user1.tokens[0].refreshToken})
            .expect(404)
    })


    it('delete[/security/devices] should be delete all sessions except current, 200 [No Content]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const authorizedUsers = await testHelpers.loginMultiplyUsersAndGetTokens(users, 4)

        const user1 = authorizedUsers[0]

        const user1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + user1.tokens[0].refreshToken})
            .expect(204)

        const updatedUser1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        expect(updatedUser1Devices[0]).toEqual(user1Devices[0])
        expect(user1Devices.length).toBe(4)
        expect(updatedUser1Devices.length).toBe(1)
    })

    it('delete[/security/devices] should be delete all sessions except current, 200 [No Content]', async () => {
        const users = await testHelpers.createMultiplyUsersWithConfirmedEmail(1)
        const authorizedUsers = await testHelpers.loginMultiplyUsersAndGetTokens(users, 4)

        const user1 = authorizedUsers[0]

        const user1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        await testHelpers.deleteUserSessionByDeviceId(user1Devices[3].deviceId, user1.tokens[3].refreshToken)

        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + user1Devices[3].deviceId)
            .set({'Cookie': 'refreshToken=' + user1.tokens[3].refreshToken})
            .expect(401)

        const updatedUser1Devices = await testHelpers.getUserSessionsByRefreshToken(user1.tokens[0].refreshToken)

        expect(updatedUser1Devices[0]).toEqual(user1Devices[0])
        expect(user1Devices.length).toBe(4)
        expect(updatedUser1Devices.length).toBe(3)
    })



})