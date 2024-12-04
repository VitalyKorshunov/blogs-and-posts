import {PostCreateType, PostId, PostInputModel, PostUpdateType} from '../../../types/entities/posts-types';
import {BlogServiceModel} from '../../../types/entities/blogs-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsRepository} from '../repositories/postsRepository';
import {inject, injectable} from 'inversify';

@injectable()
export class PostsService {
    constructor(
        @inject(PostsRepository) protected postsRepository: PostsRepository
    ) {
    }

    async createPostInBlog(post: PostInputModel): Promise<ResultType<PostId>> {
        const blog: BlogServiceModel | null = await this.postsRepository.findBlogById(post.blogId)

        if (blog) {
            const newPost: PostCreateType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: blog.id,
                blogName: blog.name,
                createdAt: new Date()
            }
            const postId: PostId = await this.postsRepository.createPost(newPost)

            return result.success(postId)
        } else {
            return result.notFound('blog not found')
        }
    }

    async deletePost(id: PostId): Promise<ResultType<boolean>> {
        const isPostDeleted = await this.postsRepository.deletePost(id)

        return result.success(isPostDeleted)
    }

    async updatePost(post: PostInputModel, id: PostId): Promise<ResultType<boolean>> {
        const blog: BlogServiceModel | null = await this.postsRepository.findBlogById(post.blogId)

        if (!blog) return result.notFound('blog not found')

        const updatedPost: PostUpdateType = {
            title: post.title,
            content: post.content,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: blog.name
        }

        const isPostUpdated = await this.postsRepository.updatePost(updatedPost, id)

        return result.success(isPostUpdated)
    }
}