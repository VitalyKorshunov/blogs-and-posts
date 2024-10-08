import {BlogCreateType, BlogId, BlogInputModel, BlogUpdateType} from '../../../types/entities/blogs-types';
import {blogsRepository} from '../repositories/blogsRepository';
import {BlogPostInputModel} from '../../../types/entities/posts-types';
import {postsService} from '../../posts/domain/posts-service';
import {ExecutionStatus} from '../../../common/utils/errorsAndStatusCodes.utils';


export const blogsService = {
    async create(blog: BlogInputModel): Promise<BlogId> {
        const newBlog: BlogCreateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date(),
            isMembership: false
        }
        return await blogsRepository.create(newBlog)
    },
    async del(id: BlogId): Promise<number> {
        return await blogsRepository.del(id)
    },
    async update(blog: BlogInputModel, id: BlogId): Promise<number> {
        const updatedBlog: BlogUpdateType = {
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl
        }

        return await blogsRepository.put(updatedBlog, id)
    },
    async createPostForBlog(blogId: BlogId, post: BlogPostInputModel): Promise<ExecutionStatus> {
        return await postsService.create({blogId: blogId, ...post})
    },
}