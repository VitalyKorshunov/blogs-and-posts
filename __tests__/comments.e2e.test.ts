import {testHelpers} from './helpers/test-helpers';

describe('/comments', () => {
    beforeAll(async () => {
        await testHelpers.connectToDbForTests()
    })
    beforeEach(async () => {
        await testHelpers.deleteAllData()
    })
    afterAll(async () => {
        await testHelpers.deleteAllData()
        await testHelpers.closeConnectToDbForTests()
    })

    // it('[/comments] should create comment in post by user, 20')
})