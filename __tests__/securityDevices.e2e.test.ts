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


    it('get[/security/devices] should be update access and refresh token, 200', async () => {
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

        // 3. get sessions by refresh token device1. LastActiveDate will be update, but other should remain as is
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


})