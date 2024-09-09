import {BlogDbType} from '../../../db/blog-db-type'
import {BlogId, BlogInputModel} from '../../../input-output-types/blogs-types'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const blogsRepository = {
    getValidQueryId(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },

    async create(newBlog: BlogDbType): Promise<BlogId> {
        const _id = await blogCollection.insertOne(newBlog)

        return _id.insertedId.toString()
    },
    async del(id: BlogId): Promise<number> {
        const blog = await blogCollection.deleteOne(this.getValidQueryId(id))

        return blog.deletedCount
    },
    async put(blog: BlogInputModel, id: BlogId): Promise<number> {
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