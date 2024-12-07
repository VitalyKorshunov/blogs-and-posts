import {BlogId, BlogInputModel} from '../types/entities/blogs-types';
import {BlogsRepository} from '../infrastructure/blogRepositories/blogsRepository';
import {inject, injectable} from 'inversify';
import {BlogModel, HydratedBlogType} from '../domain/BlogsEntity';
import {result, ResultType} from '../common/utils/errorsAndStatusCodes.utils';

@injectable()
export class BlogsService {
    constructor(
        @inject(BlogsRepository) protected blogsRepository: BlogsRepository
    ) {
    }

    async createBlog(blog: BlogInputModel): Promise<BlogId> {
        const smartBlog: HydratedBlogType = BlogModel.createBlog(
            blog.name,
            blog.description,
            blog.websiteUrl
        )

        await this.blogsRepository.save(smartBlog)
        return smartBlog.getId()
    }

    async deleteBlog(id: BlogId): Promise<number> {
        return await this.blogsRepository.deleteBlogById(id)
    }

    async updateBlog(blog: BlogInputModel, id: BlogId): Promise<ResultType<null>> {
        // const updatedBlog: BlogUpdateType = {
        //     name: blog.name,
        //     description: blog.description,
        //     websiteUrl: blog.websiteUrl
        // }
        //
        // return await this.blogsRepository.updateBlog(updatedBlog, id)

        const smartBlog: HydratedBlogType | null = await this.blogsRepository.findBlogById(id)

        if (!smartBlog) return result.notFound('Blog not found')

        smartBlog.update(
            blog.name,
            blog.description,
            blog.websiteUrl)

        await this.blogsRepository.save(smartBlog)

        return result.success(null)
    }
}