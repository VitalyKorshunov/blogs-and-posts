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

    AT_SECRET_KEY: process.env.AT_SECRET_KEY as string,
    AT_LIFE_TIME: process.env.AT_LIFE_TIME as string,
    RT_SECRET_KEY: process.env.RT_SECRET_KEY as string,
    RT_LIFE_TIME: process.env.RT_LIFE_TIME as string,

    MAIL_LOGIN: process.env.MAIL_LOGIN as string,
    MAIL_PASS: process.env.MAIL_PASS as string,
}