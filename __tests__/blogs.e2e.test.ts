import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {BlogInputModel} from '../src/input-output-types/blogs-types'
import {codedAuth, createString} from './helpers/datasets'
import {ObjectId} from 'mongodb';

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

    it('should get empty array, 200', async () => {
        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toEqual(0)
    })
    it('should get not empty array, 200', async () => {
        const createdBlog = await testHelpers.createOneBlogInDb()

        const res = await req
            .get(SETTINGS.PATH.BLOGS)
            .expect(200)

        expect(res.body.length).toEqual(1)
        expect(res.body[0]).toEqual(createdBlog)
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

        expect(updatedBlog).toEqual({...createdBlog, ...blogToUpdate })
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