import {testHelpers} from './helpers/test-helpers';
import {PostViewModel} from '../src/types/entities/posts-types';


describe('some tests', () => {
    beforeAll(async () => {
        await testHelpers.connectToDbForTests()
    })
    beforeEach(async () => { // очистка базы данных перед началом тестирования
    })
    afterAll(async () => { // очистка базы данных перед началом тестирования
        await testHelpers.closeConnectToDbForTests()
    })

    it.skip('some test', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()
        const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(200, createdBlog.id)
        console.log(await testHelpers.countPostsInDb())

    }, 1000 * 60 * 60)
})