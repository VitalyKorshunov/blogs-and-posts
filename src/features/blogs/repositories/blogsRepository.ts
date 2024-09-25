import {BlogDbInputType, BlogDbOutputType, BlogDbWithCorrectIdType} from '../../../db/blog-db-type'
import {BlogId, UpdateBlogType} from '../../../input-output-types/blogs-types'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';

export const blogsRepository = {
    _getValidQueryId(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToBlogWithCorrectId(blog: BlogDbOutputType): BlogDbWithCorrectIdType {
        const {_id, ...rest} = blog
        return {
            id: _id.toString(),
            ...rest
        }
    },


    async find(id: BlogId): Promise<BlogDbWithCorrectIdType | null> {
        const blog: BlogDbOutputType | null = await blogCollection.findOne(this._getValidQueryId(id));

        return blog ? this._mapToBlogWithCorrectId(blog) : null
    },
    async create(newBlog: BlogDbInputType): Promise<BlogId> {
        const _id = await blogCollection.insertOne(newBlog)

        return _id.insertedId.toString()
    },
    async del(id: BlogId): Promise<number> {
        const blog = await blogCollection.deleteOne(this._getValidQueryId(id))

        return blog.deletedCount
    },
    async put(blog: UpdateBlogType, id: BlogId): Promise<number> {
        const updatedBlog = await blogCollection.updateOne(this._getValidQueryId(id), {$set: blog})

        return updatedBlog.modifiedCount
    },
}