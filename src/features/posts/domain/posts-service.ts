import {PostId, PostInputModel, UpdatePostType} from '../../../input-output-types/posts-types';
import {BlogDbWithCorrectIdType} from '../../../db/blog-db-type';
import {PostDbInputType} from '../../../db/post-db-type';
import {postsRepository} from '../repositories/postsRepository';
import {blogsRepository} from '../../blogs/repositories/blogsRepository';

class NotFoundError {
    constructor(public message: string = 'entity not found') {
    }
}

export const postsService = {
    async create(post: PostInputModel): Promise<PostId> {
        const blog: BlogDbWithCorrectIdType | null = await blogsRepository.find(post.blogId)

        if (blog) {
            const newPost: PostDbInputType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: blog.id,
                blogName: blog.name,
                createdAt: new Date().toISOString()
            }

            return await postsRepository.create(newPost)
        } else {
            throw new NotFoundError('Blog not found (postsService.create)')
        }
    },
    async del(id: PostId): Promise<number> {
        return postsRepository.del(id)
    },
    async put(post: PostInputModel, id: PostId): Promise<number> {
        const blog: BlogDbWithCorrectIdType | null = await blogsRepository.find(post.blogId)

        if (blog) {
            const updatedPost: UpdatePostType = {
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: post.blogId,
                blogName: blog.name
            }

            return await postsRepository.put(updatedPost, id)
        } else {
            throw new Error('Blog not found (postsService.put)')
        }
    },
}