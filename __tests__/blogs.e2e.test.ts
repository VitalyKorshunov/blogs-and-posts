import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {BlogInputModel, BlogsSortViewModel, BlogViewModel} from '../src/input-output-types/blogs-types'
import {codedAuth, createString} from './helpers/datasets'
import {ObjectId} from 'mongodb';
import {BlogPostInputModel, PostViewModel} from '../src/input-output-types/posts-types';

describe('/blogs', () => {
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

    it('should create blog, 201', async () => {
        const newBlog: BlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201)

        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')
        expect(typeof res.body.isMembership).toEqual('boolean')
    })
    it('shouldn\'t create blog, 401', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const newBlog: BlogInputModel = {
            name: 'b1',
            description: 'd b1',
            websiteUrl: 'http://some.com',
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog) // отправка данных
            .expect(401)

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })
    it('shouldn\'t create blog, 400', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const newBlog: BlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })

    it('should create post in blog, 201', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: BlogPostInputModel = {
            title: 'p1',
            shortDescription: 'p1',
            content: 'p1'
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(201)

        const createdPost: PostViewModel = await testHelpers.findAndMapPost(res.body.id)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.id).toEqual(createdPost.id)
        expect(res.body.blogId).toEqual(blog.id)
        expect(res.body.blogName).toEqual(blog.name)
        expect(res.body.createdAt).toEqual(createdPost.createdAt)

        expect(typeof res.body.title).toEqual('string')
        expect(typeof res.body.shortDescription).toEqual('string')
        expect(typeof res.body.content).toEqual('string')
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.blogId).toEqual('string')
        expect(typeof res.body.blogName).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')
    })
    it('shouldn\'t create post in blog with incorrect fields, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: BlogPostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101)
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t create post in blog with incorrect blogId, 404', async () => {
        const newPost: BlogPostInputModel = {
            title: createString(31),
            content: createString(1001),
            shortDescription: createString(101)
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/123' + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(404)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('shouldn\'t create post in blog with incorrect auth, 401', async () => {
        const blog: BlogViewModel = await testHelpers.createOneBlogInDb()

        const newPost: BlogPostInputModel = {
            title: 'p1',
            shortDescription: 'p1',
            content: 'p1'
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth + 'some'})
            .send(newPost) // отправка данных
            .expect(401)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })

    it('should get empty array, 200', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)
        const expectedResult: BlogsSortViewModel = {
            pagesCount: 0,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: []
        }
        expect(res.body).toEqual(expectedResult)
    })
    it('should get not empty array, 200', async () => {
        const blog1 = await testHelpers.createOneBlogInDb()
        const blog2 = await testHelpers.createOneBlogInDb()
        const blog3 = await testHelpers.createOneBlogInDb()
        const blog4 = await testHelpers.createOneBlogInDb()

        const query1 = {}

        const res1 = await req
            .get(SETTINGS.PATH.BLOGS)
            .query(query1)
            .expect(200)

        const expectedResult1: BlogsSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [blog4, blog3, blog2, blog1]
        }

        expect(res1.body).toEqual(expectedResult1)

        const query2 = {
            searchNameTerm: '',
            sortBy: 'createdAt',
            sortDirection: 'asc',
            pageNumber: 2,
            pageSize: 1
        }

        const res2 = await req
            .get(SETTINGS.PATH.BLOGS)
            .query(query2)
            .expect(200)

        const expectedResult2: BlogsSortViewModel = {
            pagesCount: 4,
            page: 2,
            pageSize: 1,
            totalCount: 4,
            items: [blog2]
        }

        expect(res2.body).toEqual(expectedResult2)

        const query3 = {
            searchNameTerm: 'dsad',
            sortBy: 'createdAt',
            sortDirection: 'asc',
            pageNumber: 1,
            pageSize: 1
        }

        const res3 = await req
            .get(SETTINGS.PATH.BLOGS)
            .query(query3)
            .expect(200)

        const expectedResult3: BlogsSortViewModel = {
            pagesCount: 0,
            page: 1,
            pageSize: 1,
            totalCount: 0,
            items: []
        }

        expect(res3.body).toEqual(expectedResult3)

        const query4 = {
            searchNameTerm: 'n',
            sortBy: 'createdAt',
            sortDirection: '',
            pageNumber: 1,
            pageSize: 3
        }

        const res4 = await req
            .get(SETTINGS.PATH.BLOGS)
            .query(query4)
            .expect(200)

        const expectedResult4: BlogsSortViewModel = {
            pagesCount: 2,
            page: 1,
            pageSize: 3,
            totalCount: 4,
            items: [blog4, blog3, blog2]
        }

        expect(res4.body).toEqual(expectedResult4)

        const query5 = {
            searchNameTerm: '',
            sortBy: '',
            sortDirection: '',
            pageNumber: 1,
            pageSize: 111
        }

        const res5 = await req
            .get(SETTINGS.PATH.BLOGS)
            .query(query5)
            .expect(200)

        const expectedResult5: BlogsSortViewModel = {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 4,
            items: [blog4, blog3, blog2, blog1 ]
        }

        expect(res5.body).toEqual(expectedResult5)
    })

    it('shouldn\'t find test1, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/1')
            .expect(404)
    })
    it('shouldn\'t find test2, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + (new ObjectId().toString()))
            .expect(404)
    })
    it('should find, 200', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .expect(200)

        expect(res.body).toEqual(createdBlog)
    })

    it('should find filtered posts in blog, 200', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()
        const post1 = await testHelpers.createOnePostInDb(createdBlog.id)
        const post2 = await testHelpers.createOnePostInDb(createdBlog.id)
        const post3 = await testHelpers.createOnePostInDb(createdBlog.id)

        const query = {
            pageNumber: 3,
            pageSize: 1,
            sortBy: 'createdAt',
            sortDirection: 'asc'
        }

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + SETTINGS.PATH.POSTS)
            .query(query)
            .expect(200)

        expect(res.body).toEqual({items: [post3], pagesCount: 3, page: 3, pageSize: 1, totalCount: 3})

        const query2 = {
            pageNumber: 1,
            pageSize: 2,
            sortBy: 'createdAt',
            sortDirection: 'desc'
        }

        const res2 = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + SETTINGS.PATH.POSTS)
            .query(query2)
            .expect(200)

        expect(res2.body).toEqual({items: [post3, post2], pagesCount: 2, page: 1, pageSize: 2, totalCount: 3})

        const query3 = {}

        const res3 = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + SETTINGS.PATH.POSTS)
            .query(query3)
            .expect(200)

        expect(res3.body).toEqual({items: [post3, post2, post1], pagesCount: 1, page: 1, pageSize: 10, totalCount: 3})

        const query4 = {
            pageNumber: 1,
            pageSize: 101, //10
            sortBy: '1234', // _id
            sortDirection: 'asd' // desc
        }

        const res4 = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + SETTINGS.PATH.POSTS)
            .query(query4)
            .expect(200)

        expect(res4.body).toEqual({items: [post1, post2, post3], pagesCount: 1, page: 1, pageSize: 10, totalCount: 3})
    })
    it('shouldn\'t find filtered posts in blog, 404', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()
        const post1 = await testHelpers.createOnePostInDb(createdBlog.id)
        const post2 = await testHelpers.createOnePostInDb(createdBlog.id)
        const post3 = await testHelpers.createOnePostInDb(createdBlog.id)

        const query = {
            pageNumber: 1,
            pageSize: 101,
            sortBy: '1234',
            sortDirection: 'asd'
        }

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + '1' + SETTINGS.PATH.POSTS)
            .query(query)
            .expect(404)
    })

    it('should del, 204', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        expect(await testHelpers.countBlogsInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204)

        expect(await testHelpers.countBlogsInDb()).toEqual(0)
    })
    it('shouldn\'t del, 404', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        expect(await testHelpers.countBlogsInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404)

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })
    it('shouldn\'t del 401', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        expect(await testHelpers.countBlogsInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401)

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })

    it('should update, 204', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const blogToUpdate: BlogInputModel = {
            name: 'n2',
            description: 'd2',
            websiteUrl: 'http://some2.com',
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blogToUpdate)
            .expect(204)

        const updatedBlog = await testHelpers.findAndMapBlog(createdBlog.id)

        expect(updatedBlog).toEqual({...createdBlog, ...blogToUpdate})
    })
    it('shouldn\'t update 404', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const updatedBlog: BlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(updatedBlog)
            .expect(404) // проверка на ошибку

        expect(updatedBlog).not.toEqual({...createdBlog, ...updatedBlog})

    })
    it('shouldn\'t update2', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const blogToUpdate: BlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blogToUpdate)
            .expect(400)

        const updatedBlog = await testHelpers.findAndMapBlog(createdBlog.id)

        expect(updatedBlog).not.toEqual({...createdBlog, ...blogToUpdate})

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')
    })
    it('shouldn\'t update 401', async () => {
        const newBlog = await testHelpers.createOneBlogInDb()

        const blogToUpdate: BlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        const res = await req
            .put(SETTINGS.PATH.BLOGS + '/' + newBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(blogToUpdate)
            .expect(401)

        const updatedBlog = await testHelpers.findAndMapBlog(newBlog.id)

        expect(updatedBlog).not.toEqual({...newBlog, ...blogToUpdate})
    })
})