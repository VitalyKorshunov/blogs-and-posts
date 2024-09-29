import {app} from '../../src/app'
import {agent} from 'supertest'
import {closeConnectToDB, connectToDB, db} from '../../src/db/mongo-db';
import {SETTINGS} from '../../src/settings';
import {BlogInputModel, BlogViewModel} from '../../src/types/entities/blogs-types';
import {codedAuth} from './datasets';
import {PostInputModel, PostViewModel} from '../../src/types/entities/posts-types';
import {IdQueryDbType} from '../../src/types/db/query-db-type';
import {ObjectId, WithId} from 'mongodb';
import {UserInputModel, UserViewModel} from '../../src/types/entities/users-types';
import {UserDbType} from '../../src/types/db/user-db-type';
import {BlogDbType} from '../../src/types/db/blog-db-type';
import {PostDbType} from '../../src/types/db/post-db-type';

export const req = agent(app)

export const testHelpers = {
    connectToDbForTests: async () => {
        if (!await connectToDB('mongodb://localhost:27017', SETTINGS.DB_NAME)) {
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
        const blogs = await db.collection(SETTINGS.BLOG_COLLECTION_NAME).find({}).toArray()

        return blogs.length;
    },

    countPostsInDb: async () => {
        const posts = await db.collection(SETTINGS.POST_COLLECTION_NAME).find({}).toArray()

        return posts.length;
    },

    countUsersInDb: async () => {
        const users = await db.collection(SETTINGS.USER_COLLECTION_NAME).find({}).toArray()

        return users.length;
    },

    createBlogInDb: async (): Promise<BlogViewModel> => {
        const newBlog: BlogInputModel = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com',
        };

        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newBlog) // отправка данных
            .expect(201);

        return {...newBlog, id: res.body.id, createdAt: res.body.createdAt, isMembership: res.body.isMembership};
    },

    createPostInDb: async (blogId: string): Promise<PostViewModel> => {
        const newPost: PostInputModel = {
            title: 't1',
            shortDescription: 's1',
            content: 'c1',
            blogId: blogId,
        }

        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newPost) // отправка данных
            .expect(201)

        return {...newPost, id: res.body.id, blogName: res.body.blogName, createdAt: res.body.createdAt}
    },

    createUserInDb: async (login: string = '123', password: string = '123456'): Promise<UserViewModel> => {
        const newUser: UserInputModel = {
            login: login,
            email: `${login}@gmail.com`,
            password: password
        };

        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': 'Basic ' + codedAuth})
            .send(newUser)
            .expect(201);

        return {login: newUser.login, email: newUser.email, id: res.body.id, createdAt: res.body.createdAt};
    },

    findAndMapBlog: async (id: string): Promise<BlogViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const blog: WithId<BlogDbType> = await db.collection(SETTINGS.BLOG_COLLECTION_NAME).findOne(queryId) as WithId<BlogDbType>
        return {
            id: blog._id.toString(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        };
    },

    findAndMapPost: async (id: string): Promise<PostViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const post: WithId<PostDbType> = await db.collection(SETTINGS.POST_COLLECTION_NAME).findOne(queryId) as WithId<PostDbType>
        return {
            id: post._id.toString(),
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            content: post.content,
            shortDescription: post.shortDescription,
            title: post.title,
            createdAt: post.createdAt
        };
    },

    findAndMapUser: async (id: string): Promise<UserViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const user: WithId<UserDbType> = await db.collection(SETTINGS.USER_COLLECTION_NAME).findOne(queryId) as WithId<UserDbType>
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        };
    },

    createUsersAndGetAccessTokens(countUsers: number) {
        const tokens = []

        for (let i = 1; i <= countUsers; i++) {
            const user = this.createUserInDb(`user${i}`,)
        }
    }
}