import {PostCreateType, PostId, PostInputModel, PostUpdateType} from '../../../types/entities/posts-types';
import {postsRepository} from '../repositories/postsRepository';
import {BlogServiceModel} from '../../../types/entities/blogs-types';
import {ExecutionStatus, StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';

export const postsService = {
    async create(post: PostInputModel): Promise<ExecutionStatus> {
        const blog: BlogServiceModel | null = await postsRepository.findBlog(post.blogId)

        if (blog) {
            const newPost: PostCreateType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: blog.id,
                blogName: blog.name,
                createdAt: new Date()
            }
            const createdPost = await postsRepository.create(newPost)
            return new ExecutionStatus(StatusCode.Success, createdPost)
        } else {
            return new ExecutionStatus(StatusCode.NotFound)
        }
    },
    async del(id: PostId): Promise<number> {
        return postsRepository.del(id)
    },
    async put(post: PostInputModel, id: PostId): Promise<ExecutionStatus> {
        const blog: BlogServiceModel | null = await postsRepository.findBlog(post.blogId)

        if (blog) {
            const updatedPost: PostUpdateType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: post.blogId,
                blogName: blog.name
            }

            return new ExecutionStatus(StatusCode.Success, await postsRepository.put(updatedPost, id))
        } else {
            return new ExecutionStatus(StatusCode.NotFound)
        }
    },
}