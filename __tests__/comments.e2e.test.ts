import {req, testHelpers, UserDataWithTokensType} from './helpers/test-helpers';
import {PostViewModel} from '../src/types/entities/posts-types';
import {SETTINGS} from '../src/settings';
import {routersPaths} from '../src/common/path/paths';
import {LikeStatus} from '../src/types/db/comments-db-types';
import {ErrorsType} from '../src/types/utils/output-errors-type';
import {ObjectId} from 'mongodb';
import {CommentViewModel} from '../src/types/entities/comments-types';

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

    describe('get[/comments/{commentId}]', () => {
        it('get[/comments/{commentId}] should be get comment, 200', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const res = await req
                .get(`${SETTINGS.PATH.COMMENTS}/${createdComment.id}`)
                .expect(200)

            const resBody: CommentViewModel = res.body

            expect(Object.keys(resBody).length).toBe(5)
            expect(typeof resBody.id).toBe('string')
            expect(typeof resBody.createdAt).toBe('string')
            expect(resBody.content).toBe(comment.content)
            expect(Object.keys(resBody.commentatorInfo).length).toBe(2)
            expect(typeof resBody.commentatorInfo.userId).toBe('string')
            expect(resBody.commentatorInfo.userLogin).toBe(user1.login)
            expect(Object.keys(resBody.likesInfo).length).toBe(3)
            expect(resBody.likesInfo.myStatus).toBe('None')
            expect(resBody.likesInfo.likesCount).toBe(0)
            expect(resBody.likesInfo.dislikesCount).toBe(0)
        })

        it(`get[/comments/{commentId}] shouldn't be get comment, 404`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const invalidCommentId = new ObjectId()

            await req
                .get(`${SETTINGS.PATH.COMMENTS}/${invalidCommentId}`)
                .expect(404)

        })
    })

    describe('put[/comments/{commentId}]', () => {
        it('put[/comments/{commentId}] should be success edit comment, 204', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }
            const updatedComment1 = {
                content: testHelpers.generateString(20)
            }
            const updatedComment2 = {
                content: testHelpers.generateString(300)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const commentInfo1 = await testHelpers.getComment(createdComment.id)
            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send(updatedComment1)
                .expect(204)

            const commentInfo2 = await testHelpers.getComment(createdComment.id)
            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send(updatedComment2)
                .expect(204)

            const commentInfo3 = await testHelpers.getComment(createdComment.id)

            validateComment(commentInfo1, comment.content)
            validateComment(commentInfo2, updatedComment1.content)
            validateComment(commentInfo3, updatedComment2.content)


            function validateComment(comment: CommentViewModel, commentContent: string) {
                expect(Object.keys(comment).length).toBe(5)
                expect(typeof comment.id).toBe('string')
                expect(typeof comment.createdAt).toBe('string')
                expect(comment.content).toBe(commentContent)
                expect(Object.keys(comment.commentatorInfo).length).toBe(2)
                expect(typeof comment.commentatorInfo.userId).toBe('string')
                expect(comment.commentatorInfo.userLogin).toBe(user1.login)
                expect(Object.keys(comment.likesInfo).length).toBe(3)
                expect(comment.likesInfo.myStatus).toBe('None')
                expect(comment.likesInfo.likesCount).toBe(0)
                expect(comment.likesInfo.dislikesCount).toBe(0)
            }
        })

        it(`put[/comments/{commentId}] shouldn't be success edit comment, 400`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }
            const updatedComment1 = {
                content: testHelpers.generateString(19)
            }
            const updatedComment2 = {
                content: testHelpers.generateString(301)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)
            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send(updatedComment1)
                .expect(400)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send(updatedComment2)
                .expect(400)
        })

        it(`put[/comments/{commentId}] shouldn't be success edit comment, 401`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }
            const updatedComment = {
                content: testHelpers.generateString(20)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)
            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}` + 'invalid'})
                .send(updatedComment)
                .expect(401)
        })

        it(`put[/comments/{commentId}] shouldn't be success edit comment, 403`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(2, 1)
            const user1 = users[0]
            const user2 = users[1]

            const comment = {
                content: testHelpers.generateString(25)
            }
            const updatedComment = {
                content: testHelpers.generateString(20)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)
            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user2.tokens[0].accessToken}`})
                .send(updatedComment)
                .expect(403)
        })

        it(`put[/comments/{commentId}] shouldn't be success edit comment, 404`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(2, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }
            const updatedComment = {
                content: testHelpers.generateString(20)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const fakeCommentId = new ObjectId()

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + fakeCommentId)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send(updatedComment)
                .expect(404)
        })
    })

    describe('delete[/comments/{commentId}]', () => {
        it('delete[/comments/{commentId}] should be success delete comment, 204', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .delete(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .expect(204)

            await req
                .get(`${SETTINGS.PATH.COMMENTS}/${commentInfo1.id}`)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .expect(404)
        })

        it(`delete[/comments/{commentId}] shouldn't be success delete comment, 401`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .delete(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}` + 'invalid'})
                .expect(401)
        })

        it(`delete[/comments/{commentId}] shouldn't be success delete comment, 403`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(2, 1)
            const user1 = users[0]
            const user2 = users[1]

            const comment = {
                content: testHelpers.generateString(25)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const commentInfo1 = await testHelpers.getComment(createdComment.id)

            await req
                .delete(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id)
                .set({'Authorization': `Bearer ${user2.tokens[0].accessToken}`})
                .expect(403)
        })

        it(`delete[/comments/{commentId}] shouldn't be success delete comment, 404`, async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(1, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(25)
            }

            const createdComment = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const fakeCommentId = new ObjectId()

            await req
                .delete(SETTINGS.PATH.COMMENTS + '/' + fakeCommentId)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .expect(404)
        })
    })

    describe('put[/comments/{commentId}/like-status]', () => {
        it('put[/comments/{commentId}/like-status] should be success for change like-status, 204', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]
            const user2 = users[1]
            const user3 = users[2]
            const user4 = users[3]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const commentInfo1: CommentViewModel = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const commentViewUser1 = await testHelpers.getComment(commentInfo1.id, user1.tokens[0].accessToken)
            const commentViewUser2 = await testHelpers.getComment(commentInfo1.id, user2.tokens[0].accessToken)
            const commentViewAnonymous = await testHelpers.getComment(commentInfo1.id)

            expect(commentViewAnonymous).toEqual(commentViewUser1)
            expect(commentViewAnonymous).toEqual(commentViewUser2)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id + routersPaths.comments.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: LikeStatus.Like})
                .expect(204)

            const update1CommentViewUser1 = await testHelpers.getComment(commentInfo1.id, user1.tokens[0].accessToken)
            const update1CommentViewUser2 = await testHelpers.getComment(commentInfo1.id, user2.tokens[0].accessToken)
            const update1CommentViewAnonymous = await testHelpers.getComment(commentInfo1.id)

            expect(update1CommentViewAnonymous).toEqual(update1CommentViewUser2)
            expect(update1CommentViewAnonymous.likesInfo.myStatus).toBe('None')
            expect(update1CommentViewAnonymous.likesInfo.likesCount).toBe(1)
            expect(update1CommentViewAnonymous.likesInfo.dislikesCount).toBe(0)

            expect(update1CommentViewUser1.likesInfo.myStatus).toBe('Like')
            expect(update1CommentViewUser2.likesInfo.myStatus).toBe('None')

            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.Like, user1.tokens[0].accessToken) // must be no effect

            expect(update1CommentViewAnonymous).toEqual(update1CommentViewUser2)
            expect(update1CommentViewAnonymous.likesInfo.myStatus).toBe('None')
            expect(update1CommentViewAnonymous.likesInfo.likesCount).toBe(1)
            expect(update1CommentViewAnonymous.likesInfo.dislikesCount).toBe(0)

            expect(update1CommentViewUser1.likesInfo.myStatus).toBe('Like')
            expect(update1CommentViewUser2.likesInfo.myStatus).toBe('None')

            // set user3 like, user 4 dislike, user1 none
            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.Like, user3.tokens[0].accessToken)
            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.Dislike, user4.tokens[0].accessToken)
            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.Dislike, user4.tokens[0].accessToken)// should be no effect
            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.None, user1.tokens[0].accessToken)
            await testHelpers.setLikeForComment(commentInfo1.id, LikeStatus.None, user1.tokens[0].accessToken) // should be no effect

            const update2CommentViewUser1 = await testHelpers.getComment(commentInfo1.id, user1.tokens[0].accessToken)
            const update2CommentViewUser2 = await testHelpers.getComment(commentInfo1.id, user2.tokens[0].accessToken)
            const update2CommentViewUser3 = await testHelpers.getComment(commentInfo1.id, user3.tokens[0].accessToken)
            const update2CommentViewUser4 = await testHelpers.getComment(commentInfo1.id, user4.tokens[0].accessToken)
            const update2CommentAnonymous = await testHelpers.getComment(commentInfo1.id)

            expect(update2CommentAnonymous.likesInfo.myStatus).toBe('None')
            expect(update2CommentAnonymous.likesInfo.likesCount).toBe(1)
            expect(update2CommentAnonymous.likesInfo.dislikesCount).toBe(1)

            expect(update2CommentViewUser1.likesInfo.myStatus).toBe('None')
            expect(update2CommentViewUser2.likesInfo.myStatus).toBe('None')
            expect(update2CommentViewUser3.likesInfo.myStatus).toBe('Like')
            expect(update2CommentViewUser4.likesInfo.myStatus).toBe('Dislike')
            expect(update2CommentViewUser4.likesInfo.likesCount).toBe(1)
            expect(update2CommentViewUser4.likesInfo.dislikesCount).toBe(1)
        });

        it('put[/comments/{commentId}/like-status] shouldn\'t be success for change like-status, 400', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const commentInfo1 = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const res = await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id + routersPaths.comments.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: 'Good'})
                .expect(400)

            const resBody: ErrorsType = res.body

            expect(Object.keys(resBody.errorsMessages).length).toBe(1)
            expect(resBody.errorsMessages[0].field).toBe('likeStatus')
        })

        it('put[/comments/{commentId}/like-status] shouldn\'t be success for change like-status, 401', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            const commentInfo1 = await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + commentInfo1.id + routersPaths.comments.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}` + 'invalid'})
                .send({likeStatus: LikeStatus.Like})
                .expect(401)
        })

        it('put[/comments/{commentId}/like-status] shouldn\'t be success for change like-status, 404', async () => {
            const posts: PostViewModel[] = await testHelpers.createMultiplePostsInBlog(1)
            const postId = posts[0].id

            const users: UserDataWithTokensType[] = await testHelpers.createUsersWithConfirmedEmailAndLogin(5, 1)
            const user1 = users[0]

            const comment = {
                content: testHelpers.generateString(20)
            }

            await testHelpers.createCommentByUser(postId, comment, user1.tokens[0].accessToken)

            const fakeCommentId = new ObjectId()

            await req
                .put(SETTINGS.PATH.COMMENTS + '/' + fakeCommentId + routersPaths.comments.likeStatus)
                .set({'Authorization': `Bearer ${user1.tokens[0].accessToken}`})
                .send({likeStatus: LikeStatus.Like})
                .expect(404)
        })
    })
})