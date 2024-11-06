import {req, testHelpers} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {codedAuth} from './helpers/datasets'
import {PostInputModel, PostViewModel} from '../src/types/entities/posts-types'
import {BlogViewModel} from '../src/types/entities/blogs-types';
import {ObjectId} from 'mongodb';
import {routersPaths} from '../src/common/path/paths';

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

    it('post[/posts] should create post by admin, 201', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: PostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 't'),
            content: testHelpers.generateString(1, 'c'),
            blogId: blog.id,
        }

        expect(await testHelpers.countPostsInDb()).toEqual(0)

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(201)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(res.body.blogId).toEqual(newPost.blogId)
        expect(res.body.blogName).toEqual(blog.name)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body.createdAt).toEqual('string')

        //test2
        const newPost2: PostInputModel = {
            title: testHelpers.generateString(30, 't'),
            shortDescription: testHelpers.generateString(100, 't'),
            content: testHelpers.generateString(1000, 'c'),
            blogId: blog.id,
        }

        const res2 = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost2)
            .expect(201)

        expect(res2.body.title).toEqual(newPost2.title)
        expect(res2.body.shortDescription).toEqual(newPost2.shortDescription)
        expect(res2.body.content).toEqual(newPost2.content)
        expect(res2.body.blogId).toEqual(newPost2.blogId)
        expect(res2.body.blogName).toEqual(blog.name)
        expect(typeof res2.body.id).toEqual('string')
        expect(typeof res2.body.createdAt).toEqual('string')

        expect(await testHelpers.countPostsInDb()).toEqual(2)

    })
    it('post[/posts] shouldn\'t create post with incorrect auth, 401', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: PostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 's'),
            content: testHelpers.generateString(1, 'c'),
            blogId: blog.id,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .send(newPost)
            .expect(401)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('post[/posts] shouldn\'t create with incorrect data and invalid blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: PostInputModel = {
            title: testHelpers.generateString(0, 't'),
            shortDescription: testHelpers.generateString(0, 's'),
            content: testHelpers.generateString(0, 'c'),
            blogId: '0'
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')


        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('post[/posts] shouldn\'t create with not found blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: PostInputModel = {
            title: testHelpers.generateString(31, 't'),
            shortDescription: testHelpers.generateString(101, 's'),
            content: testHelpers.generateString(1001, 'c'),
            blogId: '63189b06003380064c4193be'
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(4)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')
        expect(res.body.errorsMessages[3].field).toEqual('blogId')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('post[/posts] shouldn\'t create with correct blogId, 400', async () => {
        const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

        const newPost: PostInputModel = {
            title: testHelpers.generateString(31, 't'),
            shortDescription: testHelpers.generateString(101, 's'),
            content: testHelpers.generateString(1001, 'c'),
            blogId: blog.id
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(400)

        expect(res.body.errorsMessages.length).toEqual(3)
        expect(res.body.errorsMessages[0].field).toEqual('title')
        expect(res.body.errorsMessages[1].field).toEqual('shortDescription')
        expect(res.body.errorsMessages[2].field).toEqual('content')

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })

    it('get[/posts] shouldn get zero posts', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS)
            .expect(200)

        expect(res.body).toEqual({items: [], page: 1, pageSize: 10, pagesCount: 0, totalCount: 0})
    })
    it('get[/posts] should get all posts', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post1 = await testHelpers.createPostByAdmin(blog.id)
        const post2 = await testHelpers.createPostByAdmin(blog.id)
        const post3 = await testHelpers.createPostByAdmin(blog.id)

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

    it('get[/posts/:id] should find', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post = await testHelpers.createPostByAdmin(blog.id)

        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + post.id)
            .expect(200)

        const mappedBlog = await testHelpers.findAndMapPost(post.id)

        expect(res.body).toEqual(mappedBlog)
    })
    it('get[/posts/:id] shouldn\'t find test1, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS + '/1')
            .expect(404)
    })
    it('get[/posts/:id] shouldn\'t find test2, 404', async () => {
        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + (new ObjectId().toString()))
            .expect(404)
    })

    it('delete[/posts/:id] should del, 204', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post = await testHelpers.createPostByAdmin(blog.id)

        expect(await testHelpers.countPostsInDb()).toEqual(1)

        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(204)

        expect(await testHelpers.countPostsInDb()).toEqual(0)
    })
    it('delete[/posts/:id] shouldn\'t del, 404', async () => {
        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .expect(404)
    })
    it('delete[/posts/:id] shouldn\'t del 401', async () => {
        const res = await req
            .delete(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic' + codedAuth}) // no space after Basic' '
            .expect(401)
    })

    it('put[/posts/:id] should update', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post = await testHelpers.createPostByAdmin(blog.id)

        const newPost: PostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 's'),
            content: testHelpers.generateString(1, 'c'),
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
    it('put[/posts/:id] shouldn\'t update with incorrect id, 404', async () => {
        const blog = await testHelpers.createBlogByAdmin();

        const newPost: PostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 's'),
            content: testHelpers.generateString(1, 'c'),
            blogId: blog.id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/1')
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(404)
    })
    it('put[/posts/:id] shouldn\'t update with not found id, 404', async () => {
        const blog = await testHelpers.createBlogByAdmin();

        const newPost: PostInputModel = {
            title: testHelpers.generateString(1, 't'),
            shortDescription: testHelpers.generateString(1, 's'),
            content: testHelpers.generateString(1, 'c'),
            blogId: blog.id,
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + new ObjectId().toString())
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(404)
    })
    it('put[/posts/:id] shouldn\'t update2, 400', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post = await testHelpers.createPostByAdmin(blog.id)

        const newPost: PostInputModel = {
            title: testHelpers.generateString(31, 't'),
            shortDescription: testHelpers.generateString(101, 's'),
            content: testHelpers.generateString(1001, 'c'),
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
    it('put[/posts/:id] shouldn\'t update, 401', async () => {
        const blog = await testHelpers.createBlogByAdmin();
        const post = await testHelpers.createPostByAdmin(blog.id)

        const newPost: PostInputModel = {
            title: testHelpers.generateString(31, 't'),
            shortDescription: testHelpers.generateString(101, 's'),
            content: testHelpers.generateString(1001, 'c'),
            blogId: '1',
        }

        const res = await req
            .put(SETTINGS.PATH.POSTS + '/' + post.id)
            .set({'Authorization': 'Basic ' + codedAuth + 'error'})
            .send(newPost)
            .expect(401)

        expect(post).toEqual(await testHelpers.findAndMapPost(post.id))
    })

    it('post[/posts/:id/comments] should create comment in post by user, 201', async () => {
        const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
        const postId = posts[0].id

        const comment = {
            content: testHelpers.generateString(20)
        }

        const res = await req
            .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments}`)
            // .set({'Authorization': `Bearer ${}`}) TODO
            .send(comment)
            // .expect(201)


    })
})