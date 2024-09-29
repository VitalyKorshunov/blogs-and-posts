import {PostCreateType, PostId, PostInputModel, PostUpdateType} from '../../../types/entities/posts-types';
import {postsRepository} from '../repositories/postsRepository';
import {BlogViewModel} from '../../../types/entities/blogs-types';

class NotFoundError {
    constructor(public message: string = 'entity not found') {
    }
}

export const postsService = {
    async create(post: PostInputModel): Promise<PostId> {
        const blog: BlogViewModel | null = await postsRepository.findBlog(post.blogId)

        if (blog) {
            const newPost: PostCreateType = {
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
        const blog: BlogViewModel | null = await postsRepository.findBlog(post.blogId)

        if (blog) {
            const updatedPost: PostUpdateType = {
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