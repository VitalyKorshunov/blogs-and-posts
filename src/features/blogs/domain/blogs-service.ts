import {BlogId, BlogInputModel, BlogViewModel} from '../../../input-output-types/blogs-types';
import {BlogDbType} from '../../../db/blog-db-type';
import {ObjectId} from 'mongodb';
import {blogsRepository} from '../repositories/blogsRepository';
import {blogsQueryRepository} from '../repositories/blogsQueryRepository';
import {BlogPostInputModel, PostId} from '../../../input-output-types/posts-types';
import {postsService} from '../../posts/domain/posts-service';


export const blogsService = {
    async create(blog: BlogInputModel): Promise<BlogId> {
        const newBlog: BlogDbType = {
            _id: new ObjectId(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        return await blogsRepository.create(newBlog)
    },
    async find(id: BlogId): Promise<BlogDbType | null> {
        //todo Как тут лучше было бы написать типизацию? С null или без?
        return await blogsQueryRepository.find(id);
    },
    async findAndMap(id: BlogId): Promise<BlogViewModel> {
        // return await blogsRepository.findAndMap(id)
        const blog: BlogDbType | null = await this.find(id)

        return this.map(blog!)
    },
    async getAll(): Promise<BlogViewModel[]> {
        const blogs: BlogDbType[] = await blogsQueryRepository.getAll()

        return blogs.map(blog => this.map(blog))
    },
    async del(id: BlogId): Promise<number> {
        return await blogsRepository.del(id)
    },
    async put(blog: BlogInputModel, id: BlogId): Promise<number> {
        const updatedBlog = {...blog}

        return await blogsRepository.put(updatedBlog, id)
    },


    map(blog: BlogDbType) {
        const blogForOutput: BlogViewModel = {
            id: blog._id.toString(),
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }
        return blogForOutput
    },
    async createPostForBlog(blogId: BlogId, post: BlogPostInputModel): Promise<PostId> {
        return await postsService.create({blogId: blogId, ...post})
    },
}