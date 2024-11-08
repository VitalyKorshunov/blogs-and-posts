import {BlogCreateType, BlogId, BlogInputModel, BlogUpdateType} from '../../../types/entities/blogs-types';
import {BlogsRepository} from '../repositories/blogsRepository';

export class BlogsService {
    constructor(protected blogsRepository: BlogsRepository) {
    }

    async createBlog(blog: BlogInputModel): Promise<BlogId> {
        const newBlog: BlogCreateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date(),
            isMembership: false
        }
        return await this.blogsRepository.createBlog(newBlog)
    }

    async deleteBlog(id: BlogId): Promise<number> {
        return await this.blogsRepository.deleteBlogById(id)
    }

    async updateBlog(blog: BlogInputModel, id: BlogId): Promise<number> {
        const updatedBlog: BlogUpdateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        }

        return await this.blogsRepository.updateBlog(updatedBlog, id)
    }
}