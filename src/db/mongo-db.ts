// ...

// получение доступа к бд
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
export const connectToDB = async (MONGO_URL: string) => {
    try {
        client = new MongoClient(MONGO_URL)
        db = client.db(SETTINGS.DB_NAME)

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

/*const client: MongoClient = new MongoClient(SETTINGS.MONGO_URL)
export const db: Db = client.db(SETTINGS.DB_NAME);

// получение доступа к коллекциям
export const blogCollection: Collection<BlogDBType> = db.collection<BlogDBType>(SETTINGS.BLOG_COLLECTION_NAME)
export const postCollection: Collection<PostDBType> = db.collection<PostDBType>(SETTINGS.POST_COLLECTION_NAME)

// проверка подключения к бд
export const connectToDB = async () => {
    try {
        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}*/



/*
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://vitaly:oJcIguddmQzsLvNn@hometasks.zkh38.mongodb.net/?retryWrites=true&w=majority&appName=HomeTasks";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);
*/
