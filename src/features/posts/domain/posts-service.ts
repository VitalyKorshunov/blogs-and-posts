import {PostId, PostInputModel} from '../../../input-output-types/posts-types';
import {BlogDbType} from '../../../db/blog-db-type';
import {PostDbType} from '../../../db/post-db-type';
import {ObjectId} from 'mongodb';
import {postsRepository} from '../repositories/postsRepository';
import {blogsQueryRepository} from '../../blogs/repositories/blogsQueryRepository';


export const postsService = {
    async create(post: PostInputModel): Promise<string> {
        // todo: обращаться за получением blogName к blogsQueryRepository или добавить метод в postsRepository?
        const blog: BlogDbType | null = await blogsQueryRepository.find(post.blogId)

        if (blog) {
            const newPost: PostDbType = {
                _id: new ObjectId(),
                title: post.title,
                content: post.content,
                shortDescription: post.shortDescription,
                blogId: new ObjectId(post.blogId),
                blogName: blog.name,
                createdAt: new Date().toISOString()
            }

            return await postsRepository.create(newPost)
        } else {
            throw new Error('Blog not found (postsService.create)')
        }
    },
    async del(id: PostId): Promise<number> {
        return postsRepository.del(id)
    },
    async put(post: PostInputModel, id: PostId): Promise<number> {
        const blog: BlogDbType | null = await blogsQueryRepository.find(post.blogId)

        if (blog) {
            const updatedPost = {...post, blogName: blog.name}

            return await postsRepository.put(updatedPost, id)
        } else {
            throw new Error('Blog not found (postsService.put)')
        }
    },
}