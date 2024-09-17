import {BlogDbType} from '../../../db/blog-db-type'
import {BlogId, UpdateBlogType} from '../../../input-output-types/blogs-types'
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
    async put(blog: UpdateBlogType, id: BlogId): Promise<number> {
        const updatedBlog = await blogCollection.updateOne(this.getValidQueryId(id), {$set: blog})

        return updatedBlog.modifiedCount
    },
}