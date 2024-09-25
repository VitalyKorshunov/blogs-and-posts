import {SETTINGS} from '../settings';
import {Collection, Db, MongoClient} from 'mongodb';
import {BlogDbInputType} from './blog-db-type';
import {PostMongoDbInputType} from './post-db-type';
import {UserDbType} from './user-db-type';

let client: MongoClient = {} as MongoClient
export let db: Db = {} as Db

// получение доступа к коллекциям
export let blogCollection: Collection<BlogDbInputType> = {} as Collection<BlogDbInputType>
export let postCollection: Collection<PostMongoDbInputType> = {} as Collection<PostMongoDbInputType>
export let userCollection: Collection<UserDbType> = {} as Collection<UserDbType>

// проверка подключения к бд
export const connectToDB = async (MONGO_URL: string, DB_NAME: string) => {

    client = new MongoClient(MONGO_URL)
    db = client.db(DB_NAME)

    blogCollection = db.collection<BlogDbInputType>(SETTINGS.BLOG_COLLECTION_NAME)
    postCollection = db.collection<PostMongoDbInputType>(SETTINGS.POST_COLLECTION_NAME)
    userCollection = db.collection<UserDbType>(SETTINGS.USER_COLLECTION_NAME)

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
