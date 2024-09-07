import {BlogDbType} from '../../../db/blog-db-type'
import {BlogInputModel} from '../../../input-output-types/blogs-types'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const blogsRepository = {
    getValidQueryId(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },

    async create(newBlog: BlogDbType): Promise<string> {
        const _id = await blogCollection.insertOne(newBlog)

        return _id.insertedId.toString()
    },
    // async find(id: string): Promise<BlogDbType | null> {
    //     //todo Как тут лучше было бы написать типизацию? С null или без?
    //
    //     return await blogCollection.findOne(this.getValidQueryId(id));
    // },
    // async findAndMap(id: string): Promise<BlogViewModel> {
    //     const blog: BlogDbType = await this.find(id) as BlogDbType
    //     return this.map(blog)
    // },
    // async getAll(): Promise<BlogViewModel[]> {
    //     const blogs: BlogDbType[] = await blogCollection.find({}).toArray()
    //
    //     //todo: Какой способ поиска и фильтрации предпочтительней:
    //     // 1). find({_id: id}, {field: true, ...etc})
    //     // 2). findOne({_id: id}) и затем маппинг
    //
    //     return blogs.map(blog => this.map(blog))
    // },
    async del(id: string): Promise<number> {
        const blog = await blogCollection.deleteOne(this.getValidQueryId(id))

        return blog.deletedCount
    },
    async put(blog: BlogInputModel, id: string): Promise<number> {
        const blogUpdated = await blogCollection.updateOne(this.getValidQueryId(id), {$set: blog})

        return blogUpdated.modifiedCount
    },
    // map(blog: BlogDbType) {
    //     const blogForOutput: BlogViewModel = {
    //         id: blog._id.toString(),
    //         description: blog.description,
    //         websiteUrl: blog.websiteUrl,
    //         name: blog.name,
    //         createdAt: blog.createdAt,
    //         isMembership: blog.isMembership
    //     }
    //     return blogForOutput
    // },
}