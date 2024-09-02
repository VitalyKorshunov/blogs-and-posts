/*
import {BlogDbType} from '../../db/blog-db-type'
import {BlogInputModel, BlogViewModel} from '../../input-output-types/blogs-types'
import {blogCollection} from '../../db/mongo-db';
import {ObjectId} from 'mongodb';

export const blogsRepositoryMongoDb = {
    async create(blog: BlogInputModel) {
        const blogId = new ObjectId()
        const newBlog: BlogDbType = {
            _id: blogId,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
        }
        await blogCollection.insertOne(newBlog)
        return blogId.toString()
    },
    async find(id: string) {
        return await blogCollection.findOne({_id: new ObjectId(id)})
    },
    findAndMap(id: string) {
        const blog = this.find(id) // ! используем этот метод если проверили существование
        return this.map(blog)
    },
    async getAll(): Promise<BlogDbType[]> {
        return await blogCollection.find({}).toArray()
    },
    async del(id: string) {
        await blogCollection.deleteOne({_id: new ObjectId(id)})
    },
    async put(blog: BlogInputModel, id: string) {
        await blogCollection.updateOne({_id: new ObjectId(id)}, {$set: {blog}})
    },
    map(blog: any) {
        const blogForOutput: BlogViewModel = {
            id: blog._id,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
        }
        return blogForOutput
    },
}*/
