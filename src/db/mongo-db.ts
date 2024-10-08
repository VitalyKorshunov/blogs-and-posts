import {SETTINGS} from '../settings';
import {Collection, Db, MongoClient} from 'mongodb';
import {BlogDbType} from '../types/db/blog-db-types';
import {PostDbType} from '../types/db/post-db-types';
import {UserDbType} from '../types/db/user-db-types';
import {CommentDbType} from '../types/db/comments-db-types';

let client: MongoClient = {} as MongoClient
export let db: Db = {} as Db

// получение доступа к коллекциям
export let blogCollection: Collection<BlogDbType> = {} as Collection<BlogDbType>
export let postCollection: Collection<PostDbType> = {} as Collection<PostDbType>
export let userCollection: Collection<UserDbType> = {} as Collection<UserDbType>
export let commentCollection: Collection<CommentDbType> = {} as Collection<CommentDbType>

// проверка подключения к бд
export const connectToDB = async (MONGO_URL: string, DB_NAME: string) => {

    client = new MongoClient(MONGO_URL)
    db = client.db(DB_NAME)

    blogCollection = db.collection<BlogDbType>(SETTINGS.BLOG_COLLECTION_NAME)
    postCollection = db.collection<PostDbType>(SETTINGS.POST_COLLECTION_NAME)
    userCollection = db.collection<UserDbType>(SETTINGS.USER_COLLECTION_NAME)
    commentCollection = db.collection<CommentDbType>(SETTINGS.COMMENT_COLLECTION_NAME)

    try {
        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}

export const closeConnectToDB = async () => {
    await client.close()
    console.log('connect to db is closed')


}
