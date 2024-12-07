import {BlogCreateType, BlogId, BlogUpdateType} from '../../types/entities/blogs-types'
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../types/db/query-db-types';
import {injectable} from 'inversify';
import {BlogModel, HydratedBlogType} from '../../domain/BlogsEntity';

@injectable()
export class BlogsRepository {
    private toIdQuery(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    async save(blogModel: HydratedBlogType) {
        await blogModel.save()
    }
    async createBlog(newBlog: BlogCreateType): Promise<BlogId> {
        const createdBlog = new BlogModel(newBlog)
        await createdBlog.save()

        return createdBlog._id.toString()
    }

    async deleteBlogById(id: BlogId): Promise<number> {
        const blog = await BlogModel.deleteOne(this.toIdQuery(id))

        return blog.deletedCount
    }

    async updateBlog(blog: BlogUpdateType, id: BlogId): Promise<number> {
        const updatedBlog = await BlogModel.updateOne(this.toIdQuery(id), {$set: blog})

        return updatedBlog.matchedCount
    }

    async findBlogById(id: BlogId): Promise<HydratedBlogType | null> {
        return BlogModel.findById(id)
    }
}