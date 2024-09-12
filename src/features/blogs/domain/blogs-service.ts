import {BlogId, BlogInputModel, BlogPostFilterViewModel, BlogViewModel} from '../../../input-output-types/blogs-types';
import {BlogDbType} from '../../../db/blog-db-type';
import {ObjectId} from 'mongodb';
import {blogsRepository} from '../repositories/blogsRepository';
import {blogsQueryRepository} from '../repositories/blogsQueryRepository';
import {BlogPostInputModel, PostId} from '../../../input-output-types/posts-types';
import {postsService} from '../../posts/domain/posts-service';
import {postsQueryRepository} from '../../posts/repositories/postsQueryRepository';
import {SortQueryDbType} from '../../../db/query-db-type';


export const blogsService = {
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
    async createPostForBlog(blogId: BlogId, post: BlogPostInputModel): Promise<PostId> {
        return await postsService.create({blogId: blogId, ...post})
    },
    async sortPostsInBlog(id: BlogId, query: any): Promise<BlogPostFilterViewModel> {

        const queryToDb: SortQueryDbType = {
            pageSize: query.pageSize,
            sortDirection: query.sortDirection,
            countSkips: (query.pageNumber - 1) * query.pageSize,
            sortBy: query.sortBy
        }

        const posts = await postsQueryRepository.filterBlogPost(queryToDb, id);
        const totalPosts = await postsQueryRepository.totalPosts(id)
        // const searchTerm = query.
        const pagesCount = Math.ceil(totalPosts / query.pageSize)
        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: query.pageSize,
            totalCount: totalPosts,
            items: posts.map(post => postsService.map(post))
        }
    }
}