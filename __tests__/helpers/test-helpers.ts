import {app} from '../../src/app'
import {agent} from 'supertest'
import {closeConnectToDB, connectToDB, db} from '../../src/db/mongo-db';
import {SETTINGS} from '../../src/settings';
import {BlogInputModel, BlogViewModel} from '../../src/input-output-types/blogs-types';
import {codedAuth} from './datasets';
import {PostInputModel, PostViewModel} from '../../src/input-output-types/posts-types';
import {IdQueryDbType} from '../../src/db/query-db-type';
import {ObjectId} from 'mongodb';
import {BlogDbType} from '../../src/db/blog-db-type';
import {PostDbType} from '../../src/db/post-db-type';
import {UserInputModel, UserViewModel} from '../../src/input-output-types/users-types';
import {UserDbType} from '../../src/db/user-db-type';

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

    createOneBlogInDb: async (): Promise<BlogViewModel> => {
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

    createOnePostInDb: async (blogId: string): Promise<PostViewModel> => {
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

    createOneUserInDb: async (login: string = '123', password: string = '123456'): Promise<UserViewModel> => {
        const newUser: UserInputModel = {
            login: login,
            email: `${login}@123.com`,
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

        const blog: BlogDbType = await db.collection(SETTINGS.BLOG_COLLECTION_NAME).findOne(queryId) as BlogDbType
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

        const post: PostDbType = await db.collection(SETTINGS.POST_COLLECTION_NAME).findOne(queryId) as PostDbType
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

        const user: UserDbType = await db.collection(SETTINGS.USER_COLLECTION_NAME).findOne(queryId) as UserDbType
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        };
    },
}