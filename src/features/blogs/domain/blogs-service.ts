import {BlogCreateType, BlogId, BlogInputModel, BlogUpdateType} from '../../../types/entities/blogs-types';
import {blogsRepository} from '../repositories/blogsRepository';
import {BlogPostInputModel} from '../../../types/entities/posts-types';
import {postsService} from '../../posts/domain/posts-service';
import {ExecutionStatus} from '../../../common/utils/errorsAndStatusCodes.utils';


export const blogsService = {
    async createBlog(blog: BlogInputModel): Promise<BlogId> {
        const newBlog: BlogCreateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date(),
            isMembership: false
        }
        return await blogsRepository.createBlog(newBlog)
    },
    async deleteBlog(id: BlogId): Promise<number> {
        return await blogsRepository.deleteBlog(id)
    },
    async updateBlog(blog: BlogInputModel, id: BlogId): Promise<number> {
        const updatedBlog: BlogUpdateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        }

        return await blogsRepository.updateBlog(updatedBlog, id)
    },
    async createPostForBlog(blogId: BlogId, post: BlogPostInputModel): Promise<ExecutionStatus> {
        return await postsService.createPost({blogId: blogId, ...post})
    },
}