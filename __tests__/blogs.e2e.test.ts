import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {BlogInputModel, BlogsSortViewModel, BlogViewModel} from '../src/types/entities/blogs-types'
import {codedAuth, createString} from './helpers/datasets'
import {ObjectId} from 'mongodb';
import {BlogPostInputModel, PostViewModel} from '../src/types/entities/posts-types';

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

    it('[/blogs] should create blog by admin, 201', async () => {
        const newBlog: BlogInputModel = {
            name: 'n',
            description: 'd',
            websiteUrl: 'https://some.com',
        }
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog)
            .expect(201)

        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')
        expect(typeof res.body.isMembership).toEqual('boolean')
        expect(res.body.isMembership).toEqual(false)

        const newBlog2: BlogInputModel = {
            name: testHelpers.generateString(15, 'n'),
            description: testHelpers.generateString(500, 'd'),
            websiteUrl: 'https://' + testHelpers.generateString(100 - 8 - 4, 'w') + '.com',
        }
        expect(newBlog2.name.length).toBe(15)
        expect(newBlog2.description.length).toBe(500)
        expect(newBlog2.websiteUrl.length).toBe(100)

        const res2 = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog2)
            .expect(201)

        expect(res2.body.name).toEqual(newBlog2.name)
        expect(res2.body.description).toEqual(newBlog2.description)
        expect(res2.body.websiteUrl).toEqual(newBlog2.websiteUrl)
        expect(typeof res2.body.id).toEqual('string')
        expect(typeof res2.body.createdAt).toEqual('string')
        expect(typeof res2.body.isMembership).toEqual('boolean')
    })
    it('[/blogs] shouldn\'t create blog by unauthorized admin, 401', async () => {
        const newBlog: BlogInputModel = {
            name: 'b1',
            description: 'd b1',
            websiteUrl: 'https://some.com',
        }

        await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .expect(401)

        expect(await testHelpers.countBlogsInDb()).toEqual(0)
    })
    it('[/blogs] shouldn\'t create blog by admin with incorrect data, 400', async () => {
        //test 1
        const newBlog: BlogInputModel = {
            name: testHelpers.generateString(0),
            description: testHelpers.generateString(0),
            websiteUrl: 'https://' + testHelpers.generateString(100 - 8 - 4 + 1, 'w') + '.com', // length 101
        }
        expect(newBlog.name.length).toBe(0)
        expect(newBlog.description.length).toBe(0)
        expect(newBlog.websiteUrl.length).toBe(101)

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog)
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('name')
        expect(res.body.errorsMessages[1].field).toEqual('description')
        expect(res.body.errorsMessages[2].field).toEqual('websiteUrl')

        // test2
        const newBlog2: BlogInputModel = {
            name: testHelpers.generateString(16, 'n'),
            description: testHelpers.generateString(501, 'd'),
            websiteUrl: 'http://' + testHelpers.generateString(100 - 7 - 4, 'w') + '.com', //length 100 but http, must be https
        }
        expect(newBlog2.name.length).toBe(16)
        expect(newBlog2.description.length).toBe(501)
        expect(newBlog2.websiteUrl.length).toBe(100)

        const res2 = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog2)
            .expect(400)

        expect(res2.body.errorsMessages.length).toEqual(3)
        expect(res2.body.errorsMessages[0].field).toEqual('name')
        expect(res2.body.errorsMessages[1].field).toEqual('description')
        expect(res2.body.errorsMessages[2].field).toEqual('websiteUrl')

        expect(await testHelpers.countBlogsInDb()).toEqual(0)
    })

    it('[/blogs/{blogId}/posts] should create post in blog by admin, 201', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: BlogPostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 's'),
            content: testHelpers.generateString(1, 'c')
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(201)

        const createdPost: PostViewModel = await testHelpers.getPostById(res.body.id)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.id).toEqual(createdPost.id)
        expect(res.body.blogId).toEqual(blog.id)
        expect(res.body.blogName).toEqual(blog.name)
        expect(res.body.createdAt).toEqual(createdPost.createdAt)

        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.title).toEqual('string')
        expect(typeof res.body.shortDescription).toEqual('string')
        expect(typeof res.body.content).toEqual('string')
        expect(typeof res.body.blogId).toEqual('string')
        expect(typeof res.body.blogName).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')

        // test2
        const newPost2: BlogPostInputModel = {
            title: testHelpers.generateString(30, 't'),
            shortDescription: testHelpers.generateString(100, 's'),
            content: testHelpers.generateString(1000, 'c')
        }

        const res2 = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost2)
            .expect(201)

        const createdPost2: PostViewModel = await testHelpers.getPostById(res2.body.id)

        expect(res2.body.title).toEqual(newPost2.title)
        expect(res2.body.shortDescription).toEqual(newPost2.shortDescription)
        expect(res2.body.content).toEqual(newPost2.content)
        expect(res2.body.id).toEqual(createdPost2.id)
        expect(res2.body.blogId).toEqual(blog.id)
        expect(res2.body.blogName).toEqual(blog.name)
        expect(res2.body.createdAt).toEqual(createdPost2.createdAt)

        expect(typeof res2.body.id).toEqual('string')
        expect(typeof res2.body.title).toEqual('string')
        expect(typeof res2.body.shortDescription).toEqual('string')
        expect(typeof res2.body.content).toEqual('string')
        expect(typeof res2.body.blogId).toEqual('string')
        expect(typeof res2.body.blogName).toEqual('string')
        expect(typeof res2.body.createdAt).toEqual('string')


        expect(await testHelpers.countPostsInDb()).toBe(2)
    })
    it('[/blogs/{blogId}/posts] shouldn\'t create post in blog with incorrect fields length by admin, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: BlogPostInputModel = {
            title: testHelpers.generateString(0),
            shortDescription: testHelpers.generateString(0),
            content: testHelpers.generateString(0)
        }

        const res = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')

        //test2
        const newPost2: BlogPostInputModel = {
            title: testHelpers.generateString(31),
            shortDescription: testHelpers.generateString(101),
            content: testHelpers.generateString(1001)
        }

        const res2 = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost2)
            .expect(400)

        expect(res2.body.errorsMessages.length).toEqual(3)
        expect(res2.body.errorsMessages[0].field).toEqual('title')
        expect(res2.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res2.body.errorsMessages[2].field).toEqual('content')

        //test3
        const newPost3 = {
            title: 2,
            shortDescription: {},
            content: ['3']
        }

        const res3 = await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost3)
            .expect(400)

        expect(res3.body.errorsMessages.length).toEqual(3)
        expect(res3.body.errorsMessages[0].field).toEqual('title')
        expect(res3.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res3.body.errorsMessages[2].field).toEqual('content')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('[/blogs/{blogId}/posts] shouldn\'t create post in blog with incorrect blogId, 404', async () => {
        const newPost: BlogPostInputModel = {
            title: testHelpers.generateString(9999),
            shortDescription: testHelpers.generateString(9999),
            content: testHelpers.generateString(9999)
        }

        await req
            .post(SETTINGS.PATH.BLOGS + '/123' + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(404)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('[/blogs/{blogId}/posts] shouldn\'t create post in blog with incorrect auth by admin, 401', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: BlogPostInputModel = {
            title: testHelpers.generateString(9999),
            shortDescription: testHelpers.generateString(9999),
            content: testHelpers.generateString(9999)
        }

        await req
            .post(SETTINGS.PATH.BLOGS + '/' + blog.id + SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth + 'some'})
            .send(newPost)
            .expect(401)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })

    it('[/blogs] should get empty blog array, 200', async () => {
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
    it('[/blogs] should get not empty blog array, 200', async () => {
        const blogs = await testHelpers.createMultipleBlogs(4)
        const blog1 = blogs[0]
        const blog2 = blogs[1]
        const blog3 = blogs[2]
        const blog4 = blogs[3]

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
            items: [blog4, blog3, blog2, blog1]
        }

        expect(res5.body).toEqual(expectedResult5)
    })

    it('[/blogs/{blogId}] shouldn\'t find blog by blogId with invalid blogId, 404', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS + '/1')
            .expect(404)
    })
    it('[/blogs/{blogId}] shouldn\'t find blog by blogId with valid blogId, 404', async () => {
        await req
            .get(SETTINGS.PATH.BLOGS + '/' + (new ObjectId().toString()))
            .expect(404)
    })
    it('[/blogs/{blogId}] should find, 200', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()

        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .expect(200)

        expect(res.body).toEqual(createdBlog)
    })

    it('[/blogs/{blogId}/posts] should find filtered posts in blog, 200', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()
        const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(3, createdBlog.id)
        const post1 = posts[0]
        const post2 = posts[1]
        const post3 = posts[2]

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
    it('[/blogs/{blogId}/posts] shouldn\'t find filtered posts in blog, 404', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()
        await testHelpers.createMultiplePostsInBlogByAdmin(3, createdBlog.id)

        const query = {
            pageNumber: 1,
            pageSize: 101,
            sortBy: '1234',
            sortDirection: 'asd'
        }

        await req
            .get(SETTINGS.PATH.BLOGS + '/' + createdBlog.id + '1' + SETTINGS.PATH.POSTS)
            .query(query)
            .expect(404)
    })

    it('[/blogs/{blogId}] should delete blog by admin, 204', async () => {
        const blogs = await testHelpers.createMultipleBlogs(5)

        expect(await testHelpers.countBlogsInDb()).toEqual(5)

        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + blogs[0].id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204)

        expect(await testHelpers.countBlogsInDb()).toEqual(4)
    })
    it('[/blogs/{blogId}] shouldn\'t delete blog by admin, 404', async () => {
        await testHelpers.createBlogByAdmin()

        expect(await testHelpers.countBlogsInDb()).toEqual(1)

        await req
            .delete(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404)

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })
    it('[/blogs/{blogId}] shouldn\'t delete blog by admin with incorrect auth header, 401', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()

        expect(await testHelpers.countBlogsInDb()).toEqual(1)

        await req
            .delete(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic' + codedAuth}) // no ' '
            .expect(401)

        expect(await testHelpers.countBlogsInDb()).toEqual(1)
    })

    it('[/blogs/{blogId}] should update blog by admin, 204', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()

        const blogToUpdate: BlogInputModel = {
            name: 'n2',
            description: 'd2',
            websiteUrl: 'https://some2.com',
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + createdBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(blogToUpdate)
            .expect(204)

        const updatedBlog = await testHelpers.findAndMapBlog(createdBlog.id)

        expect(updatedBlog).toEqual({...createdBlog, ...blogToUpdate})
    })
    it('[/blogs/{blogId}] shouldn\'t update blog by admin, 404', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()

        const updatedBlog: BlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(updatedBlog)
            .expect(404) // проверка на ошибку

        expect(updatedBlog).not.toEqual({...createdBlog, ...updatedBlog})

    })
    it('[/blogs/{blogId}] shouldn\'t update blog by admin, 400', async () => {
        const createdBlog = await testHelpers.createBlogByAdmin()

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
    it('[/blogs/{blogId}] shouldn\'t update blog by admin with incorrect auth header, 401', async () => {
        const newBlog = await testHelpers.createBlogByAdmin()

        const blogToUpdate: BlogInputModel = {
            name: createString(16),
            description: createString(501),
            websiteUrl: createString(101),
        }

        await req
            .put(SETTINGS.PATH.BLOGS + '/' + newBlog.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(blogToUpdate)
            .expect(401)

        const updatedBlog = await testHelpers.findAndMapBlog(newBlog.id)

        expect(updatedBlog).not.toEqual({...newBlog, ...blogToUpdate})
    })
})