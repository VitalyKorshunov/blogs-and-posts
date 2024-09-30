import {BlogDbType} from '../../../types/db/blog-db-types'
import {BlogCreateType, BlogId, BlogUpdateType, BlogViewModel} from '../../../types/entities/blogs-types'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';

export const blogsRepository = {
    _toIdQuery(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToBlogWithCorrectId(blog: WithId<BlogDbType>): BlogViewModel {
        const {_id, ...rest} = blog
        return {
            id: _id.toString(),
            ...rest
        }
    },


    async create(newBlog: BlogCreateType): Promise<BlogId> {
        const _id = await blogCollection.insertOne(newBlog)

        return _id.insertedId.toString()
    },
    async del(id: BlogId): Promise<number> {
        const blog = await blogCollection.deleteOne(this._toIdQuery(id))

        return blog.deletedCount
    },
    async put(blog: BlogUpdateType, id: BlogId): Promise<number> {
        const updatedBlog = await blogCollection.updateOne(this._toIdQuery(id), {$set: blog})

        return updatedBlog.modifiedCount
    },
}