import {app} from '../../src/app'
import {agent} from 'supertest'
import {closeConnectToDB, connectToDB, db} from '../../src/db/mongo-db';
import {SETTINGS} from '../../src/settings';
import {BlogId, BlogInputModel, BlogViewModel} from '../../src/types/entities/blogs-types';
import {codedAuth} from './datasets';
import {PostId, PostInputModel, PostsSortViewModel, PostViewModel} from '../../src/types/entities/posts-types';
import {IdQueryDbType} from '../../src/types/db/query-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserInputModel, UserViewModel} from '../../src/types/entities/users-types';
import {UserDbType} from '../../src/types/db/user-db-types';
import {BlogDbType} from '../../src/types/db/blog-db-types';
import {routersPaths} from '../../src/common/path/paths';
import {nodemailerService} from '../../src/common/adapters/nodemailer.service';
import {UserModel} from '../../src/features/users/domain/usersEntity';
import {MongoMemoryServer} from 'mongodb-memory-server';
import {Response} from 'superagent';
import {AuthTokensType} from '../../src/types/auth/auth-types';
import {SecurityViewModel} from '../../src/types/entities/security-types';
import {CommentInputModel, CommentsSortViewModel, CommentViewModel} from '../../src/types/entities/comments-types';
import {LikeStatus} from '../../src/types/db/comments-db-types';
import {SortInputQueryType} from '../../src/types/utils/sort-types';

export type UserDataType = {
    login: string
    email: string
    password: string
    code: string
}

export type UserDataWithTokensType = UserDataType & {
    tokens: AuthTokensType[]
}

export const req = agent(app)

export const testHelpers = {
    mock: {
        nodemailerService: {
            sendEmailConfirmation() {
                return jest.spyOn(nodemailerService, 'sendEmailConfirmation').mockResolvedValue()
            }
        },
        restoreAllMocks() {
            jest.restoreAllMocks()
        }
    },

    getAccessTokenFromResponseBody(response: Response): string {
        return response.body.accessToken
    },
    getRefreshTokenFromResponseCookie(response: Response): string {
        return response.headers['set-cookie'][0].split(';')[0].split('=')[1]
    },

    getTokensFromResponse(response: Response): AuthTokensType {
        const accessToken = this.getAccessTokenFromResponseBody(response)
        const refreshToken = this.getRefreshTokenFromResponseCookie(response)

        return {
            accessToken,
            refreshToken
        }
    },

    generateString(count: number, symbol: string = 'x'): string {
        let string = ''

        for (let i = 1; i <= count; i++) {
            string += symbol
        }

        return string
    },

    connectToDbForTests: async () => {
        const mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        if (!await connectToDB(uri, SETTINGS.DB.DB_NAME)) {
            console.log('not connect to db');
            process.exit(1);
        }
    },
    closeConnectToDbForTests: async () => {
        await closeConnectToDB()
    },

    deleteAllData: async () => {
        await req.delete(SETTINGS.PATH.TESTING + '/all-data');
    },

    countBlogsInDb: async () => {
        const blogs = await db.collection(SETTINGS.DB.BLOG_COLLECTION_NAME).find({}).toArray()

        return blogs.length;
    },
    countPostsInDb: async () => {
        const posts = await db.collection(SETTINGS.DB.POST_COLLECTION_NAME).find({}).toArray()

        return posts.length;
    },
    countUsersInDb: async () => {
        const users = await db.collection(SETTINGS.DB.USER_COLLECTION_NAME).find({}).toArray()

        return users.length;
    },

    createBlogByAdmin: async (name: string = 'n1', description: string = 'd1', websiteUrl: string = 'https://some.com'): Promise<BlogViewModel> => {
        const newBlog: BlogInputModel = {
            name,
            description,
            websiteUrl,
        };

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog)
            .expect(201);

        return res.body;
    },
    createPostByAdmin: async (blogId: string, title: string = 't1', shortDescription: string = 's1', content: string = 'c1'): Promise<PostViewModel> => {
        const newPost: PostInputModel = {
            title,
            shortDescription,
            content,
            blogId,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost)
            .expect(201)

        return res.body
    },
    createUserByAdmin: async (login: string = '123', password: string = '123456'): Promise<UserViewModel> => {
        const newUser: UserInputModel = {
            login,
            email: `${login}@gmail.com`,
            password
        };

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser)
            .expect(201);

        return res.body;
    },
    createUserByUser: async (login: string = '123', email: string = '123@gmail.com', password: string = '123456'): Promise<UserDataType> => {
        const mockedSendEmailConfirmation = testHelpers.mock.nodemailerService.sendEmailConfirmation()

        const newUser: UserInputModel = {
            login,
            email,
            password
        };

        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registration)
            .send(newUser)
            .expect(204);

        const lastCall = mockedSendEmailConfirmation.mock.lastCall
        if (!lastCall) {
            throw new Error('last call undefined')
        }

        const [emailFromMock, codeFromMock] = lastCall

        return {
            email: emailFromMock,
            code: codeFromMock,
            login,
            password
        }
    },

    async getPostById(postId: PostId, accessToken?: string): Promise<PostViewModel> {
        const res = await req
            .get(SETTINGS.PATH.POSTS + '/' + postId)
            .set({'Authorization': `Bearer ${accessToken}`})
            .expect(200)

        return res.body
    },

    async getPostsForBlog(blogId: BlogId, accessToken?: string, query: Partial<SortInputQueryType> = {}): Promise<PostsSortViewModel> {
        const res = await req
            .get(SETTINGS.PATH.BLOGS + '/' + blogId + routersPaths.posts.posts)
            .set({'Authorization': `Bearer ${accessToken}`})
            .query(query)
            .expect(200)

        return res.body
    },

    findAndMapBlog: async (id: string): Promise<BlogViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const blog: WithId<BlogDbType> = await db.collection(SETTINGS.DB.BLOG_COLLECTION_NAME).findOne(queryId) as WithId<BlogDbType>
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership
        };
    },

    findAndMapUserByIndex: async (index: number = 0): Promise<WithId<UserDbType>> => {
        const users: WithId<UserDbType>[] = await UserModel.find({}, {__v: 0}).lean()

        return users[index];
    },

    async confirmRegistrationByCode(code: string) {
        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.registrationConfirmation)
            .send({code})
            .expect(204)
    },

    async createMultipleBlogs(count: number, blogNameFirstSymbol: string = 'n', blogDescriptionFirstSymbol: string = 'd'): Promise<BlogViewModel[]> {
        const blogs = []

        for (let i = 1; i <= count; i++) {
            blogs.push(await this.createBlogByAdmin(`${blogNameFirstSymbol}${i}`, `${blogDescriptionFirstSymbol}${i}`))
        }
        expect(blogs.length).toBe(count)
        return blogs
    },

    async createMultiplePostsInBlogByAdmin(count: number, blogId?: string): Promise<PostViewModel[]> {
        if (!blogId) {
            const blog = await this.createBlogByAdmin()
            blogId = blog.id
        }

        const posts = []

        for (let i = 1; i <= count; i++) {
            posts.push(await this.createPostByAdmin(blogId))
        }
        expect(posts.length).toBe(count)
        return posts
    },

    async createMultiplyUsersWithUnconfirmedEmail(countUsers: number): Promise<UserDataType[]> {
        const usersData: UserDataType[] = []

        for (let i = 1; i <= countUsers; i++) {
            usersData.push(await this.createUserByUser('user' + i, 'user' + i + '@gmail.com'))
        }

        expect(usersData.length).toBe(countUsers)

        return usersData
    },

    async createMultiplyUsersWithConfirmedEmail(countUsers: number): Promise<UserDataType[]> {
        const usersData: UserDataType[] = await this.createMultiplyUsersWithUnconfirmedEmail(countUsers)

        for (let i = 1; i <= countUsers; i++) {
            await this.confirmRegistrationByCode(usersData[i - 1].code)
        }

        return usersData
    },

    async loginUserAndGetTokens(loginOrEmail: string, password: string, userAgent?: string): Promise<AuthTokensType> {
        const response = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.login)
            .set(userAgent ? {'user-agent': userAgent} : {})
            .send({loginOrEmail, password})
            .expect(200)

        const {accessToken} = response.body
        expect(typeof accessToken).toBe('string')

        const refreshToken = this.getRefreshTokenFromResponseCookie(response)
        expect(typeof refreshToken).toBe('string')

        return {
            accessToken,
            refreshToken
        }
    },

    async updateTokensForUser(refreshToken: string): Promise<AuthTokensType> {
        const res = await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.refreshToken)
            .set({'Cookie': 'refreshToken=' + refreshToken})
            .expect(200)

        return this.getTokensFromResponse(res)
    },

    async getUserSessionsByRefreshToken(refreshToken: string): Promise<SecurityViewModel[]> {
        const res = await req
            .get(SETTINGS.PATH.SECURITY + routersPaths.security.devices)
            .set({'Cookie': 'refreshToken=' + refreshToken})
            .expect(200)

        return res.body
    },

    async deleteUserSessionByDeviceId(deviceId: string, refreshToken: string): Promise<void> {
        await req
            .delete(SETTINGS.PATH.SECURITY + routersPaths.security.devices + '/' + deviceId)
            .set({'Cookie': 'refreshToken=' + refreshToken})
            .expect(204)
    },

    async logoutUserByRefreshToken(refreshToken: string): Promise<void> {
        await req
            .post(SETTINGS.PATH.AUTH + routersPaths.auth.logout)
            .set({'Cookie': 'refreshToken=' + refreshToken})
            .expect(204)
    },

    async loginMultiplyUsersAndGetTokens(users: UserDataType[], authCount: number): Promise<UserDataWithTokensType[]> {
        const authorizedUsers: UserDataWithTokensType[] = []

        for (let i = 0; i < users.length; i++) {
            const tokens: AuthTokensType[] = []

            for (let j = 0; j < authCount; j++) {
                tokens.push(await this.loginUserAndGetTokens(users[i].login, users[i].password, `${users[i]} agent${j}`))
            }

            authorizedUsers.push({...users[i], tokens})
        }

        return authorizedUsers
    },

    async createUsersWithConfirmedEmailAndLogin(usersCount: number = 1, authCount: number = 1): Promise<UserDataWithTokensType[]> {
        const createdUsers: UserDataType[] = await this.createMultiplyUsersWithConfirmedEmail(usersCount)

        return await this.loginMultiplyUsersAndGetTokens(createdUsers, authCount)
    },

    async createCommentByUser(postId: string, comment: CommentInputModel, accessToken: string): Promise<CommentViewModel> {
        const res = await req
            .post(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
            .set({'Authorization': `Bearer ${accessToken}`})
            .send(comment)
            .expect(201)

        return res.body
    },

    async getPostComments(postId: string, accessToken?: string): Promise<CommentsSortViewModel> {
        const postComments = await req
            .get(`${SETTINGS.PATH.POSTS}/${postId}${routersPaths.comments.comments}`)
            .set({'Authorization': `Bearer ${accessToken}`})
            .expect(200)

        return postComments.body
    },

    async getComment(commentId: string, accessToken?: string): Promise<CommentViewModel> {
        const comment = await req
            .get(`${SETTINGS.PATH.COMMENTS}/${commentId}`)
            .set({'Authorization': `Bearer ${accessToken}`})
            .expect(200)

        return comment.body
    },

    async setLikeForPost(postId: string, likeStatus: LikeStatus, accessToken: string): Promise<void> {
        await req
            .put(SETTINGS.PATH.POSTS + '/' + postId + routersPaths.posts.likeStatus)
            .set({'Authorization': `Bearer ${accessToken}`})
            .send({likeStatus: likeStatus})
            .expect(204)
    },

    async setLikeForComment(commentId: string, likeStatus: LikeStatus, accessToken: string): Promise<void> {
        await req
            .put(SETTINGS.PATH.COMMENTS + '/' + commentId + routersPaths.comments.likeStatus)
            .set({'Authorization': `Bearer ${accessToken}`})
            .send({likeStatus: likeStatus})
            .expect(204)
    }
}