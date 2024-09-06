import {BlogDbType} from '../../db/blog-db-type'
import {BlogInputModel, BlogViewModel} from '../../input-output-types/blogs-types'
import {blogCollection} from '../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../db/query-db-type';

export const blogsRepository = {
    async create(blog: BlogInputModel): Promise<string> {
        const newBlog: BlogDbType = {
            _id: new ObjectId(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        await blogCollection.insertOne(newBlog)
        return newBlog._id.toString()
    },
    async find(id: string): Promise<BlogDbType | null> {
        //todo Как тут лучше было бы написать типизацию? С null или без?
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}
        return await blogCollection.findOne(queryId);
    },
    async findAndMap(id: string): Promise<BlogViewModel> {
        const blog: BlogDbType = await this.find(id) as BlogDbType
        return this.map(blog)
    },
    async getAll(): Promise<BlogViewModel[]> {
        const blogs: BlogDbType[] = await blogCollection.find({}).toArray();

        //todo: Какой способ поиска и фильтрации предпочтительней:
        // 1). find({_id: id}, {field: true, ...etc})
        // 2). findOne({_id: id}) и затем маппинг

        return blogs.map(blog => this.map(blog))
    },
    async del(id: string): Promise<number> {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}
        const blog = await blogCollection.deleteOne(queryId)

        return blog.deletedCount
    },
    async put(blog: BlogInputModel, id: string): Promise<number> {
        const queryId: IdQueryDbType = {_id: new ObjectId(id)}

        const blogUpdated = await blogCollection.updateOne(queryId, {$set: {...blog}})

        return blogUpdated.modifiedCount
    },
    map(blog: BlogDbType) {
        const blogForOutput: BlogViewModel = {
            id: blog._id.toString(),
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }
        return blogForOutput
    },
}