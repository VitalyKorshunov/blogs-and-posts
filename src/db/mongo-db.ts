import {SETTINGS} from '../settings';
import {Collection, Db, MongoClient} from 'mongodb';
import {CommentDbType} from '../types/db/comments-db-types';
import {RateLimitDBType} from '../types/db/rateLimit-db-types';
import {SecurityDbType} from '../types/db/security-db-types';
import * as mongoose from 'mongoose';

let client: MongoClient = {} as MongoClient
export let db: Db = {} as Db


// получение доступа к коллекциям
// export let blogCollection: Collection<BlogDbType> = {} as Collection<BlogDbType>
// export let postCollection: Collection<PostDbType> = {} as Collection<PostDbType>
// export let userCollection: Collection<UserDbType> = {} as Collection<UserDbType>
export let commentCollection: Collection<CommentDbType> = {} as Collection<CommentDbType>
export let rateLimitCollection: Collection<RateLimitDBType> = {} as Collection<RateLimitDBType>
// export let securityCollection: Collection<SecurityDbType> = {} as Collection<SecurityDbType>


// проверка подключения к бд
export const connectToDB = async (MONGO_URL: string, DB_NAME: string) => {

    client = new MongoClient(MONGO_URL)
    db = client.db(DB_NAME)

    // blogCollection = db.collection<BlogDbType>(SETTINGS.DB.BLOG_COLLECTION_NAME)
    // postCollection = db.collection<PostDbType>(SETTINGS.DB.POST_COLLECTION_NAME)
    // userCollection = db.collection<UserDbType>(SETTINGS.DB.USER_COLLECTION_NAME)
    commentCollection = db.collection<CommentDbType>(SETTINGS.DB.COMMENT_COLLECTION_NAME)
    rateLimitCollection = db.collection<RateLimitDBType>(SETTINGS.DB.RATE_LIMIT_COLLECTION_NAME)
    // securityCollection = db.collection<SecurityDbType>(SETTINGS.DB.SESSION_COLLECTION_NAME)

    try {
        await mongoose.connect(MONGO_URL, {dbName: DB_NAME})

        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)

        await mongoose.disconnect()

        await client.close()
        return false
    }
}

export const closeConnectToDB = async () => {
    await mongoose.disconnect()
    await client.close()
    console.log('connect to db is closed')
}
