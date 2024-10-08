import {config} from 'dotenv'

config()

export const SETTINGS = {
    PORT: process.env.PORT || 3003,
    PATH: {
        AUTH: '/auth',
        BLOGS: '/blogs',
        POSTS: '/posts',
        USERS: '/users',
        COMMENTS: '/comments',
        TESTING: '/testing'
    },

    ADMIN: process.env.ADMIN as string,
    MONGO_URL: process.env.MONGO_URL as string,
    DB_NAME: process.env.DB_NAME as string,
    BLOG_COLLECTION_NAME: process.env.BLOG_COLLECTION_NAME as string,
    POST_COLLECTION_NAME: process.env.POST_COLLECTION_NAME as string,
    USER_COLLECTION_NAME: process.env.USER_COLLECTION_NAME as string,
    COMMENT_COLLECTION_NAME: process.env.COMMENT_COLLECTION_NAME as string,

    SECRET_KEY: process.env.SECRET_KEY as string,
    LIFE_TIME_JWT: process.env.LIFE_TIME_JWT as string,

    MAIL_LOGIN: process.env.MAIL_LOGIN as string,
    MAIL_PASS: process.env.MAIL_PASS as string,
}