import {config} from 'dotenv'
config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    PORT: process.env.PORT || 3003,
    PATH: {
        AUTH: '/auth',
        BLOGS: '/blogs',
        POSTS: '/posts',
        USERS: '/users',
        TESTING: '/testing'
    },

    ADMIN: process.env.ADMIN as string,
    MONGO_URL: process.env.MONGO_URL as string,
    DB_NAME: process.env.DB_NAME as string,
    BLOG_COLLECTION_NAME: process.env.BLOG_COLLECTION_NAME as string,
    POST_COLLECTION_NAME: process.env.POST_COLLECTION_NAME as string,
    USER_COLLECTION_NAME: process.env.USER_COLLECTION_NAME as string,
    SECRET_KEY: process.env.SECRET_KEY as string,
    LIFE_TIME_JWT: process.env.LIFE_TIME_JWT as string
}