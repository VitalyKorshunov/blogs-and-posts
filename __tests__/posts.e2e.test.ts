import {req, testHelpers, UserDataWithTokensType} from './helpers/test-helpers'
import {SETTINGS} from '../src/settings'
import {codedAuth} from './helpers/datasets'
import {PostInputModel, PostViewModel} from '../src/types/entities/posts-types'
import {BlogViewModel} from '../src/types/entities/blogs-types';
import {ObjectId} from 'mongodb';
import {routersPaths} from '../src/common/path/paths';
import {CommentsSortViewModel, CommentViewModel} from '../src/types/entities/comments-types';
import {ErrorsType} from '../src/types/utils/output-errors-type';
import {LikeStatus} from '../src/types/db/comments-db-types';

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

    describe('post[/posts]', () => {
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

            const resBody1: PostViewModel = res.body
            checkData(resBody1, newPost, blog.name)

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

            const resBody2: PostViewModel = res2.body
            checkData(resBody2, newPost2, blog.name)

            expect(await testHelpers.countPostsInDb()).toEqual(2)


            function checkData(resBody: PostViewModel, postInputData: PostInputModel, blogName: string): void {
                expect(Object.keys(resBody).length).toBe(8)
                expect(typeof resBody.id).toEqual('string')
                expect(resBody.title).toEqual(postInputData.title)
                expect(resBody.shortDescription).toEqual(postInputData.shortDescription)
                expect(resBody.content).toEqual(postInputData.content)
                expect(resBody.blogId).toEqual(postInputData.blogId)
                expect(resBody.blogName).toEqual(blogName)
                expect(typeof resBody.createdAt).toEqual('string')
                expect(Object.keys(resBody.extendedLikesInfo).length).toBe(4)
                expect(resBody.extendedLikesInfo.likesCount).toBe(0)
                expect(resBody.extendedLikesInfo.dislikesCount).toBe(0)
                expect(resBody.extendedLikesInfo.myStatus).toBe('None')
                expect(resBody.extendedLikesInfo.newestLikes).toEqual([])
            }
        })
        it('post[/posts] shouldn\'t create post with incorrect auth, 401', async () => {
            const blog: BlogViewModel = await testHelpers.createBlogByAdmin()

            const newPost: PostInputModel = {
                title: testHelpers.generateString(1, 't'),
                shortDescription: testHelpers.generateString(1, 's'),
                content: testHelpers.generateString(1, 'c'),
                blogId: blog.id,
            }

            await req
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
    })

    describe('get[/posts]', () => {
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
            expect(res1.body).toEqual({
                items: [post3, post2, post1],
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 3
            })

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

            expect(res4.body).toEqual({
                items: [post1, post2, post3],
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 3
            })
        })
    })

    describe('get[/posts/:id]', () => {
        it('get[/posts/:id] should find, 200', async () => {
            const blog = await testHelpers.createBlogByAdmin();
            const post = await testHelpers.createPostByAdmin(blog.id)

            const res = await req
                .get(SETTINGS.PATH.POSTS + '/' + post.id)
                .expect(200)

            const resBody: PostViewModel = res.body

            checkData(resBody, post, blog.name)

            expect(Object.keys(resBody).length).toEqual(8)

            function checkData(resBody: PostViewModel, postInputData: PostViewModel, blogName: string): void {
                expect(Object.keys(resBody).length).toBe(8)
                expect(typeof resBody.id).toEqual('string')
                expect(resBody.title).toEqual(postInputData.title)
                expect(resBody.shortDescription).toEqual(postInputData.shortDescription)
                expect(resBody.content).toEqual(postInputData.content)
                expect(resBody.blogId).toEqual(postInputData.blogId)
                expect(resBody.blogName).toEqual(blogName)
                expect(typeof resBody.createdAt).toEqual('string')
                expect(Object.keys(resBody.extendedLikesInfo).length).toBe(4)
                expect(resBody.extendedLikesInfo.likesCount).toBe(0)
                expect(resBody.extendedLikesInfo.dislikesCount).toBe(0)
                expect(resBody.extendedLikesInfo.myStatus).toBe('None')
                expect(resBody.extendedLikesInfo.newestLikes).toEqual([])
            }
        })
        it('get[/posts/:id] shouldn\'t find test1, 404', async () => {
            await testHelpers.createMultiplePostsInBlogByAdmin(2)

            await req
                .get(SETTINGS.PATH.POSTS + '/1')
                .expect(404)
        })
        it('get[/posts/:id] shouldn\'t find test2, 404', async () => {
            await testHelpers.createMultiplePostsInBlogByAdmin(2)

            await req
                .get(SETTINGS.PATH.POSTS + '/' + (new ObjectId().toString()))
                .expect(404)
        })
    })

    describe('delete[/posts/:id]', () => {
        it('delete[/posts/:id] should del, 204', async () => {
            const blog = await testHelpers.createBlogByAdmin();
            const post = await testHelpers.createPostByAdmin(blog.id)

            expect(await testHelpers.countPostsInDb()).toEqual(1)

            await req
                .delete(SETTINGS.PATH.POSTS + '/' + post.id)
                .set({'Authorization': 'Basic ' + codedAuth})
                .expect(204)

            expect(await testHelpers.countPostsInDb()).toEqual(0)
        })
        it('delete[/posts/:id] shouldn\'t del, 404', async () => {
            await req
                .delete(SETTINGS.PATH.POSTS + '/1')
                .set({'Authorization': 'Basic ' + codedAuth})
                .expect(404)
        })
        it('delete[/posts/:id] shouldn\'t del 401', async () => {
            await req
                .delete(SETTINGS.PATH.POSTS + '/1')
                .set({'Authorization': 'Basic' + codedAuth}) // no space after Basic' '
                .expect(401)
        })
    })

    describe('put[/posts/:id]]', () => {
        it('put[/posts/:id] should update', async () => {
            const blog = await testHelpers.createBlogByAdmin();
            const post = await testHelpers.createPostByAdmin(blog.id)

            const newPost: PostInputModel = {
                title: testHelpers.generateString(1, 't'),
                shortDescription: testHelpers.generateString(1, 's'),
                content: testHelpers.generateString(1, 'c'),
                blogId: blog.id,
            }

            await req
                .put(SETTINGS.PATH.POSTS + '/' + post.id)
                .set({'Authorization': 'Basic ' + codedAuth})
                .send(newPost)
                .expect(204)

            const updatedPost: PostViewModel | undefined = await testHelpers.getPostById(post.id)
            const expectedPost: PostViewModel = {
                id: post.id,
                blogName: blog.name,
                createdAt: post.createdAt,
                extendedLikesInfo: post.extendedLikesInfo,
                ...newPost,
            }

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

            await req
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

            await req
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

            expect(post).toEqual(await testHelpers.getPostById(post.id))

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

            await req
                .put(SETTINGS.PATH.POSTS + '/' + post.id)
                .set({'Authorization': 'Basic ' + codedAuth + 'error'})
                .send(newPost)
                .expect(401)

            expect(post).toEqual(await testHelpers.getPostById(post.id))
        })
    })

    describe('post[/posts/{postId}/comments]', () => {
        it('post[/posts/{postId}/comments] should create comment in post by user, 201', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const res = await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': `Bearer ${user.tokens[0].accessToken}`})
                .send(comment)
                .expect(201)

            console.log(res.body)
            const resComment: CommentViewModel = res.body

            expect(Object.keys(resComment).length).toBe(5)

            expect(typeof resComment.id).toBe('string')
            expect(typeof resComment.createdAt).toBe('string')
            expect(resComment.content).toBe(comment.content)

            expect(typeof resComment.commentatorInfo).toBe('object')
            expect(Object.keys(resComment.commentatorInfo).length).toBe(2)
            expect(typeof resComment.commentatorInfo.userId).toBe('string')
            expect(resComment.commentatorInfo.userLogin).toBe(user.login)

            expect(typeof resComment.likesInfo).toBe('object')
            expect(Object.keys(resComment.likesInfo).length).toBe(3)
            expect(resComment.likesInfo.likesCount).toBe(0)
            expect(resComment.likesInfo.dislikesCount).toBe(0)
            expect(resComment.likesInfo.myStatus).toBe('None')

            const comment2 = {
                content: testHelpers.generateString(300)
            }
            await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': `Bearer ${user.tokens[0].accessToken}`})
                .send(comment2)
                .expect(201)
        })

        it('post[/posts/{postId}/comments] shouldn\'t create comment in post by user, 400', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user = users[0]

            const comment = {
                content: testHelpers.generateString(19)
            }

            const res = await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': `Bearer ${user.tokens[0].accessToken}`})
                .send(comment)
                .expect(400)

            const resBody: ErrorsType = res.body

            expect(Object.keys(resBody.errorsMessages).length).toEqual(1)
            expect(resBody.errorsMessages[0].field).toBe('content')

            const comment2 = {
                content: testHelpers.generateString(301)
            }

            await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': `Bearer ${user.tokens[0].accessToken}`})
                .send(comment2)
                .expect(400)
        })

        it('post[/posts/{postId}/comments] shouldn\'t create comment in post by user, 401', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const comment = {
                content: testHelpers.generateString(19)
            }

            await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': 'Bearer invalid'})
                .send(comment)
                .expect(401)
        })

        it('post[/posts/{postId}/comments] shouldn\'t create comment in post by user, 404', async () => {
            const postId = new ObjectId()

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user = users[0]

            const comment = {
                content: testHelpers.generateString(19)
            }

            await req
                .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .set({'Authorization': `Bearer ${user.tokens[0].accessToken}`})
                .send(comment)
                .expect(404)
        })
    })

    describe('get[/posts/{postId}/comments]', () => {
        it('get[/posts/:id/comments] should be get all comments for post, 200', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const commentInfo = await testHelpers.createCommentByUser(postId, comment, user.tokens[0].accessToken)

            const res = await req
                .get(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .expect(200)

            const postComments: CommentsSortViewModel = res.body

            expect(Object.keys(postComments).length).toBe(5)
            expect(postComments.pagesCount).toBe(1)
            expect(postComments.page).toBe(1)
            expect(postComments.pageSize).toBe(10)
            expect(postComments.totalCount).toBe(1)
            expect(postComments.items.length).toBe(1)
            expect(postComments.items[0]).toEqual(commentInfo)
        });

        it('get[/posts/:id/comments] shouldn\'t be get all comments for post, 404', async () => {
            const postId = new ObjectId()

            await req
                .get(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
                .expect(404)
        })
    })

    describe('put[/posts/{postId}/like-status]', () => {
        it('put[/posts/{postId}/like-status] should be success for change like-status, 204', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]
            const user2 = users[1]
            const user3 = users[2]
            const user4 = users[3]

            const update0PostViewUser1 = await testHelpers.getPostById(postId, user1.tokens[0].accessToken)
            const update0PostViewUser2 = await testHelpers.getPostById(postId, user2.tokens[0].accessToken)
            const update0PostViewAnonymous = await testHelpers.getPostById(postId)

            expect(update0PostViewAnonymous).toEqual(update0PostViewUser1)
            expect(update0PostViewAnonymous).toEqual(update0PostViewUser2)

            expect(update0PostViewUser1.extendedLikesInfo.myStatus).toBe('None')
            expect(update0PostViewUser1.extendedLikesInfo.likesCount).toBe(0)
            expect(update0PostViewUser1.extendedLikesInfo.dislikesCount).toBe(0)
            expect(update0PostViewUser1.extendedLikesInfo.newestLikes).toEqual([])

            await req
                .put(SETTINGS.PATH.POSTS + '/' + postId + routersPaths.posts.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: LikeStatus.Like})
                .expect(204)

            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user1.tokens[0].accessToken) // must be no effect

            const update1PostViewUser1 = await testHelpers.getPostById(postId, user1.tokens[0].accessToken)
            const update1PostViewUser2 = await testHelpers.getPostById(postId, user2.tokens[0].accessToken)
            const update1PostViewAnonymous = await testHelpers.getPostById(postId)
            // console.log(update1PostViewUser1)
            // console.log(update1PostViewUser2)
            // console.log(update1PostViewAnonymous)

            expect(update1PostViewAnonymous).toEqual(update1PostViewUser2)
            expect(update1PostViewAnonymous.extendedLikesInfo.myStatus).toBe('None')
            expect(update1PostViewAnonymous.extendedLikesInfo.likesCount).toBe(1)
            expect(update1PostViewAnonymous.extendedLikesInfo.dislikesCount).toBe(0)
            expect(typeof update1PostViewAnonymous.extendedLikesInfo.newestLikes[0].addedAt).toBe('string')
            expect(typeof update1PostViewAnonymous.extendedLikesInfo.newestLikes[0].userId).toBe('string')
            expect(update1PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user1.login)

            expect(update1PostViewUser1.extendedLikesInfo.myStatus).toBe('Like')
            expect(update1PostViewUser1.extendedLikesInfo.likesCount).toBe(1)
            expect(update1PostViewUser1.extendedLikesInfo.dislikesCount).toBe(0)
            expect(update1PostViewUser1.extendedLikesInfo.newestLikes.length).toBe(1)
            expect(typeof update1PostViewUser1.extendedLikesInfo.newestLikes[0].addedAt).toBe('string')
            expect(typeof update1PostViewUser1.extendedLikesInfo.newestLikes[0].userId).toBe('string')
            expect(update1PostViewUser1.extendedLikesInfo.newestLikes[0].login).toBe(user1.login)

            expect(update1PostViewUser2.extendedLikesInfo.myStatus).toBe('None')

            // set user3 like, user 4 dislike, user1 none
            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user3.tokens[0].accessToken)
            await testHelpers.setLikeForPost(postId, LikeStatus.Dislike, user4.tokens[0].accessToken)
            await testHelpers.setLikeForPost(postId, LikeStatus.Dislike, user4.tokens[0].accessToken)// should be no effect
            await testHelpers.setLikeForPost(postId, LikeStatus.None, user1.tokens[0].accessToken)
            await testHelpers.setLikeForPost(postId, LikeStatus.None, user1.tokens[0].accessToken) // should be no effect

            const update2PostViewUser1 = await testHelpers.getPostById(postId, user1.tokens[0].accessToken)
            const update2PostViewUser2 = await testHelpers.getPostById(postId, user2.tokens[0].accessToken)
            const update2PostViewUser3 = await testHelpers.getPostById(postId, user3.tokens[0].accessToken)
            const update2PostViewUser4 = await testHelpers.getPostById(postId, user4.tokens[0].accessToken)
            const update2PostViewAnonymous = await testHelpers.getPostById(postId)

            expect(update2PostViewAnonymous.extendedLikesInfo.myStatus).toBe('None')
            expect(update2PostViewAnonymous.extendedLikesInfo.likesCount).toBe(1)
            expect(update2PostViewAnonymous.extendedLikesInfo.dislikesCount).toBe(1)
            expect(update2PostViewAnonymous.extendedLikesInfo.newestLikes.length).toBe(1)
            expect(typeof update2PostViewAnonymous.extendedLikesInfo.newestLikes[0].addedAt).toBe('string')
            expect(typeof update2PostViewAnonymous.extendedLikesInfo.newestLikes[0].userId).toBe('string')
            expect(update2PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user3.login)

            expect(update2PostViewUser1.extendedLikesInfo.myStatus).toBe('None')
            expect(update2PostViewUser2.extendedLikesInfo.myStatus).toBe('None')
            expect(update2PostViewUser3.extendedLikesInfo.myStatus).toBe('Like')
            expect(update2PostViewUser4.extendedLikesInfo.myStatus).toBe('Dislike')
            expect(update2PostViewUser4.extendedLikesInfo.likesCount).toBe(1)
            expect(update2PostViewUser4.extendedLikesInfo.dislikesCount).toBe(1)

            // user1 Like. newestLikes should be [{user3, user1}]
            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user1.tokens[0].accessToken)
            const update3PostViewAnonymous = await testHelpers.getPostById(postId)
            console.log(update3PostViewAnonymous.extendedLikesInfo.newestLikes)
            expect(update3PostViewAnonymous.extendedLikesInfo.newestLikes.length).toBe(2)
            expect(update3PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user3.login)
            expect(update3PostViewAnonymous.extendedLikesInfo.newestLikes[1].login).toBe(user1.login)

            // user2 Like, user4 Like. newestLikes should be [{user2, user4, user3}]. user1 is missing because max length is 3 and user1 was the first to like. user2 set like status after user1, user3 set like status after user2
            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user2.tokens[0].accessToken)
            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user4.tokens[0].accessToken)

            const update4PostViewAnonymous = await testHelpers.getPostById(postId)
            console.log(update4PostViewAnonymous.extendedLikesInfo.newestLikes)
            expect(update4PostViewAnonymous.extendedLikesInfo.newestLikes.length).toBe(3)
            expect(update4PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user2.login)
            expect(update4PostViewAnonymous.extendedLikesInfo.newestLikes[1].login).toBe(user4.login)
            expect(update4PostViewAnonymous.extendedLikesInfo.newestLikes[2].login).toBe(user3.login)

            // user2 Dislike. newestLikes should be [{user4, user3, user1}]
            await testHelpers.setLikeForPost(postId, LikeStatus.Dislike, user2.tokens[0].accessToken)
            const update5PostViewAnonymous = await testHelpers.getPostById(postId)

            expect(update5PostViewAnonymous.extendedLikesInfo.newestLikes.length).toBe(3)
            expect(update5PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user4.login)
            expect(update5PostViewAnonymous.extendedLikesInfo.newestLikes[1].login).toBe(user3.login)
            expect(update5PostViewAnonymous.extendedLikesInfo.newestLikes[2].login).toBe(user1.login)

            // user2 Like. newestLikes should be [{user2, user4, user3}]
            await testHelpers.setLikeForPost(postId, LikeStatus.Like, user2.tokens[0].accessToken)
            const update6PostViewAnonymous = await testHelpers.getPostById(postId)

            expect(update6PostViewAnonymous.extendedLikesInfo.newestLikes.length).toBe(3)
            expect(update6PostViewAnonymous.extendedLikesInfo.newestLikes[0].login).toBe(user2.login)
            expect(update6PostViewAnonymous.extendedLikesInfo.newestLikes[1].login).toBe(user4.login)
            expect(update6PostViewAnonymous.extendedLikesInfo.newestLikes[2].login).toBe(user3.login)
        });

        it('put[/posts/{postId}/like-status] shouldn\'t be success for change like-status, 400', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const res = await req
                .put(SETTINGS.PATH.POSTS + '/' + postId + routersPaths.posts.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: 'Good'})
                .expect(400)

            const resBody: ErrorsType = res.body

            expect(Object.keys(resBody.errorsMessages).length).toBe(1)
            expect(resBody.errorsMessages[0].field).toBe('likeStatus')
        })

        it('put[/posts/{postId}/like-status] shouldn\'t be success for change like-status, 401', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            await req
                .put(SETTINGS.PATH.POSTS + '/' + postId + routersPaths.posts.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}` + 'invalid'})
                .send({likeStatus: LikeStatus.Like})
                .expect(401)
        })

        it('put[/posts/{postId}/like-status] shouldn\'t be success for change like-status, 404', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlogByAdmin(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const fakePostId = new ObjectId()

            await req
                .put(SETTINGS.PATH.POSTS + '/' + fakePostId + routersPaths.posts.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: LikeStatus.Like})
                .expect(404)
        })
    })

})