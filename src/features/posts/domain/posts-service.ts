import {PostInputModel, PostViewModel} from '../../../input-output-types/posts-types';
import {BlogDbType} from '../../../db/blog-db-type';
import {PostDbType} from '../../../db/post-db-type';
import {ObjectId} from 'mongodb';
import {blogsService} from '../../blogs/domain/blogs-service';
import {postsRepository} from '../repositories/postsRepository';
import {postsQueryRepository} from '../repositories/postsQueryRepository';


export const postsService = {
    async create(post: PostInputModel): Promise<string> {
        const blogName: BlogDbType | null = await blogsService.find(post.blogId)

        const newPost: PostDbType = {
            _id: new ObjectId(),
            title: post.title,
            content: post.content,
            shortDescription: post.shortDescription,
            blogId: post.blogId,
            blogName: blogName!.name,
            createdAt: new Date().toISOString()
        }

        return await postsRepository.create(newPost)
    },
    async find(id: string): Promise<PostDbType | null> {
        return await postsQueryRepository.find(id)
    },
    async findAndMap(id: string): Promise<PostViewModel> {
        const post: PostDbType | null = await this.find(id)

        return this.map(post!)
    },
    async getAll(): Promise<PostViewModel[]> {
        const posts: PostDbType[] = await postsQueryRepository.getAll()

        return posts.map((post) => this.map(post))
    },
    async del(id: string): Promise<number> {
        return postsRepository.del(id)
    },
    async put(post: PostInputModel, id: string): Promise<number> {
        const blog = await blogsService.find(post.blogId)
        const updatedPost = {...post, blogName: blog!.name}

        return postsRepository.put(updatedPost, id)
    },

    map(post: PostDbType) {
        const postForOutput: PostViewModel = {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt
        }
        return postForOutput
    }
}