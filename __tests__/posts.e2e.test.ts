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

    it('should get empty array', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body.length).toEqual(0) // проверяем ответ эндпоинта
    })
    it('should get not empty array', async () => {
        const blog = await testHelpers.createOneBlogInDb();
        const post = await testHelpers.createOnePostInDb(blog.id)

        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        const mappedPost = await testHelpers.findAndMapPost(post.id)

        expect(res.body.length).toEqual(1)
        expect(res.body[0]).toEqual(mappedPost)
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