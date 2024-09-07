import {SETTINGS} from '../settings';
import {Collection, Db, MongoClient} from 'mongodb';
import {BlogDbType} from './blog-db-type';
import {PostDbType} from './post-db-type';

let client: MongoClient = {} as MongoClient
export let db: Db = {} as Db

// получение доступа к коллекциям
export let blogCollection: Collection<BlogDbType> = {} as Collection<BlogDbType>
export let postCollection: Collection<PostDbType> = {} as Collection<PostDbType>

// проверка подключения к бд
export const connectToDB = async (MONGO_URL: string, DB_NAME: string) => {
    try {
        client = new MongoClient(MONGO_URL)
        db = client.db(DB_NAME)

        blogCollection = db.collection<BlogDbType>(SETTINGS.BLOG_COLLECTION_NAME)
        postCollection = db.collection<PostDbType>(SETTINGS.POST_COLLECTION_NAME)

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
