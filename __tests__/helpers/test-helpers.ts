import {app} from '../../src/app'
import {agent} from 'supertest'
import {closeConnectToDB, connectToDB, db} from '../../src/db/mongo-db';
import {SETTINGS} from '../../src/settings';
import {BlogInputModel, BlogViewModel} from '../../src/types/entities/blogs-types';
import {codedAuth} from './datasets';
import {PostInputModel, PostViewModel} from '../../src/types/entities/posts-types';
import {IdQueryDbType} from '../../src/types/db/query-db-types';
import {ObjectId, WithId} from 'mongodb';
import {UserInputModel, UserViewModel} from '../../src/types/entities/users-types';
import {UserDbType} from '../../src/types/db/user-db-types';
import {BlogDbType} from '../../src/types/db/blog-db-types';
import {PostDbType} from '../../src/types/db/post-db-types';

export const req = agent(app)

export const testHelpers = {
    generateString(count: number, symbol: string = 'x'): string {
        let string = ''

        for (let i = 1; i <= count; i++) {
            string += symbol
        }

        return string
    },

    connectToDbForTests: async () => {
        if (!await connectToDB('mongodb://localhost:27017', SETTINGS.DB.DB_NAME)) {
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

    createBlogInDb: async (name: string = 'n1', description: string = 'd1', websiteUrl: string = 'https://some.com'): Promise<BlogViewModel> => {
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

    createPostInDb: async (blogId: string, title: string = 't1', shortDescription: string = 's1', content: string = 'c1'): Promise<PostViewModel> => {
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

    createUserInDb: async (login: string = '123', password: string = '123456'): Promise<UserViewModel> => {
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

    findAndMapPost: async (id: string): Promise<PostViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const post: WithId<PostDbType> = await db.collection(SETTINGS.DB.POST_COLLECTION_NAME).findOne(queryId) as WithId<PostDbType>
        return {
            id: post._id.toString(),
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            content: post.content,
            shortDescription: post.shortDescription,
            title: post.title,
            createdAt: post.createdAt.toISOString()
        };
    },

    findAndMapUser: async (id: string): Promise<UserViewModel> => {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const user: WithId<UserDbType> = await db.collection(SETTINGS.DB.USER_COLLECTION_NAME).findOne(queryId) as WithId<UserDbType>
        return {
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt.toISOString()
        };
    },

    async createMultipleBlogs(count: number, blogNameFirstSymbol: string = 'n', blogDescriptionFirstSymbol: string = 'd'): Promise<BlogViewModel[]> {
        const blogs = []

        for (let i = 1; i <= count; i++) {
            blogs.push(await this.createBlogInDb(`${blogNameFirstSymbol}${i}`, `${blogDescriptionFirstSymbol}${i}`))
        }
        expect(blogs.length).toBe(count)
        return blogs
    },

    async createMultiplePostsInBlog(count: number, blogId: string): Promise<PostViewModel[]> {
        const posts = []

        for (let i = 1; i <= count; i++) {
            posts.push(await this.createPostInDb(blogId))
        }
        expect(posts.length).toBe(count)
        return posts
    },

    async createUsersAndGetAccessTokens(countUsers: number) {
        const tokens = []

        for (let i = 1; i <= countUsers; i++) {
            const user: UserViewModel = await this.createUserInDb(`user${i}`)
        }
    }
}