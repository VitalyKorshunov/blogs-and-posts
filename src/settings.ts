import {config} from 'dotenv'

config() // добавление переменных из файла .env в process.env

export const SETTINGS = {
    // все хардкодные значения должны быть здесь, для удобства их изменения
    PORT: process.env.PORT || 3003,
    PATH: {
        BLOGS: '/blogs',
        POSTS: '/posts',
        TESTING: '/testing'
    },

    ADMIN: process.env.ADMIN || '',
    MONGO_URL: process.env.MONGO_URL || '',
    DB_NAME: process.env.DB_NAME || '',
    BLOG_COLLECTION_NAME: process.env.BLOG_COLLECTION_NAME || '',
    POST_COLLECTION_NAME: process.env.POST_COLLECTION_NAME || ''
}

// console.log(process.env.ADMIN)