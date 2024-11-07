import {PostCreateType, PostId, PostInputModel, PostUpdateType} from '../../../types/entities/posts-types';
import {BlogServiceModel} from '../../../types/entities/blogs-types';
import {ExecutionStatus, result, ResultType, StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsRepository} from '../repositories/postsRepository';

export class PostsService {
    private postsRepository: PostsRepository

    constructor() {
        this.postsRepository = new PostsRepository()
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

    async deletePost(id: PostId): Promise<number> {
        return this.postsRepository.deletePost(id)
    }

    async updatePost(post: PostInputModel, id: PostId): Promise<ExecutionStatus> {
        const blog: BlogServiceModel | null = await this.postsRepository.findBlogById(post.blogId)

        if (blog) {
            const updatedPost: PostUpdateType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: post.blogId,
                blogName: blog.name
            }

            return new ExecutionStatus(StatusCode.Success, await this.postsRepository.updatePost(updatedPost, id))
        } else {
            return new ExecutionStatus(StatusCode.NotFound)
        }
    }
}