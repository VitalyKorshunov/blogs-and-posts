import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {codedAuth, createString} from './helpers/datasets'
import {PostInputModel, PostViewModel} from '../src/input-output-types/posts-types'
import {BlogViewModel} from '../src/input-output-types/blogs-types';
import {ObjectId} from 'mongodb';

describe('/posts', () => {
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

    it('should create', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: PostInputModel = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: blog.id,
        }

        expect(await testHelpers.countPostsInDb()).toEqual(0)

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(201)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.blogId).toEqual(newPost.blogId)
        expect(res.body.blogName).toEqual(blog.name)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')
    })
    it('shouldn\'t create, 401', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: PostInputModel = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: blog.id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send(newPost) // отправка данных
            .expect(401)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t create with incorrect blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: PostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1'
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t create with not found blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: PostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '63189b06003380064c4193be'
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t create with correct blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: PostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: blog.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })

    it('shouldn get zero posts', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body).toEqual({items: [], page: 1, pageSize: 10, pagesCount: 0, totalCount: 0}) // проверяем ответ эндпоинта
    })
    it('should get all posts', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post1 = await testHelpers.createOnePostInDb(blog.id)
        const post2 = await testHelpers.createOnePostInDb(blog.id)
        const post3 = await testHelpers.createOnePostInDb(blog.id)

        const query1 = {}

        const res1 = await req
            .get(SETTINGS.PATH.POSTS)
            .query(query1)
            .expect(200)

        expect(res1.body.items.length).toEqual(3)
        expect(res1.body).toEqual({items: [post3, post2, post1], pagesCount: 1, page: 1, pageSize: 10, totalCount: 3})

        const query2 = {
            pageNumber: 3,
            pageSize: 1,
            sortBy: 'createdAt',
            sortDirection: 'asc'
        }

        const res2 = await req
            .get(SETTINGS.PATH.POSTS)
            .query(query2)
            .expect(200)

        expect(res2.body).toEqual({items: [post3], pagesCount: 3, page: 3, pageSize: 1, totalCount: 3})

        const query3 = {
            pageNumber: 1,
            pageSize: 2,
            sortBy: 'createdAt',
            sortDirection: 'desc'
        }

        const res3 = await req
            .get(SETTINGS.PATH.POSTS)
            .query(query3)
            .expect(200)

        expect(res3.body).toEqual({items: [post3, post2], pagesCount: 2, page: 1, pageSize: 2, totalCount: 3})

        const query4 = {
            pageNumber: 1,
            pageSize: 101, //10
            sortBy: '1234', // _id
            sortDirection: 'asd' // desc
        }

        const res4 = await req
            .get(SETTINGS.PATH.POSTS)
            .query(query4)
            .expect(200)

        expect(res4.body).toEqual({items: [post1, post2, post3], pagesCount: 1, page: 1, pageSize: 10, totalCount: 3})
    })

    it('shouldn\'t find test1, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404)
    })
    it('shouldn\'t find test2, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + (new ObjectId().toString()))
            .expect(404)
    })
    it('should find', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + post.id)
            .expect(200) // проверка на ошибку

        const mappedBlog = await testHelpers.findAndMapPost(post.id)

        expect(res.body).toEqual(mappedBlog)
    })

    it('should del', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        expect(await testHelpers.countPostsInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t del', async () => {
        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404)
    })
    it('shouldn\'t del 401', async () => {
        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no space after Basic' '
            .expect(401)
    })

    it('should update', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        const newPost: PostInputModel = {
            title: 't2',
            shortDescription: 's2',
            content: 'c2',
            blogId: blog.id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(204)

        const updatedPost: PostViewModel | undefined = await testHelpers.findAndMapPost(post.id)
        const expectedPost: PostViewModel = {...newPost, blogName: blog.name, id: post.id, createdAt: post.createdAt}

        expect(updatedPost).toEqual(expectedPost)
    })
    it('shouldn\'t update with incorrect id, 404', async () => {
        const blog = await testHelpers.createOneBlogInDb();

        const newPost: PostInputModel = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: blog.id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(404)
    })
    it('shouldn\'t update with not found id, 404', async () => {
        const blog = await testHelpers.createOneBlogInDb();

        const newPost: PostInputModel = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: blog.id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + new ObjectId().toString())
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(404)
    })
    it('shouldn\'t update2, 400', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        const newPost: PostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(400)

        expect(post).toEqual(await testHelpers.findAndMapPost(post.id))

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')
    })
    it('shouldn\'t update 401', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        const newPost: PostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(newPost)
            .expect(401)

        expect(post).toEqual(await testHelpers.findAndMapPost(post.id))
    })
})