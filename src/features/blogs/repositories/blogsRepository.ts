import {BlogDbType} from '../../../types/db/blog-db-types'
import {BlogCreateType, BlogId, BlogServiceModel, BlogUpdateType} from '../../../types/entities/blogs-types'
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {BlogModel} from '../../../db/mongo-db';

export const blogsRepository = {
    _toIdQuery(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToBlogWithCorrectId(blog: WithId<BlogDbType>): BlogServiceModel {
        const {_id, ...rest} = blog
        return {
            id: _id.toString(),
            ...rest
        }
    },


    async createBlog(newBlog: BlogCreateType): Promise<BlogId> {
        const _id = await BlogModel.insertMany([newBlog])

        return _id[0].id
    },
    async deleteBlog(id: BlogId): Promise<number> {
        const blog = await BlogModel.deleteOne(this._toIdQuery(id))

        return blog.deletedCount
    },
    async updateBlog(blog: BlogUpdateType, id: BlogId): Promise<number> {
        const updatedBlog = await BlogModel.updateOne(this._toIdQuery(id), {$set: blog})

        return updatedBlog.modifiedCount
    },
}