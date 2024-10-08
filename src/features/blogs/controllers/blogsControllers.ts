import {Request, Response} from 'express';
import {BlogInputModel, BlogsSortViewModel, BlogViewModel} from '../../../types/entities/blogs-types';
import {blogsService} from '../domain/blogs-service';
import {BlogPostInputModel, PostId, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {blogsQueryRepository} from '../repositories/blogsQueryRepository';
import {postsQueryRepository} from '../../posts/repositories/postsQueryRepository';
import {ParamType} from '../../../types/request-response/request-types';

export const blogsControllers = {
    async createBlog(req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) {
        const newBlogId = await blogsService.createBlog(req.body)
        const newBlog = await blogsQueryRepository.findAndMap(newBlogId)
        res
            .status(201)
            .json(newBlog)
    },

    async createPostInBlog(req: Request<ParamType, {}, BlogPostInputModel>, res: Response<PostViewModel>) {
        const result = await blogsService.createPostForBlog(req.params.id, req.body)
        const postId: PostId = result.data
        console.log(result.data)

        const post: PostViewModel = await postsQueryRepository.findAndMap(postId)
        res
            .status(201)
            .json(post)
    },

    async updateBlog(req: Request<ParamType, any, BlogInputModel>, res: Response) {
        await blogsService.updateBlog(req.body, req.params.id)
        res.sendStatus(204)
    },

    async delBlog(req: Request<ParamType>, res: Response) {
        await blogsService.deleteBlog(req.params.id)
        res.sendStatus(204)
    },

    async findBlog(req: Request<ParamType>, res: Response<BlogViewModel | {}>) {
        const blog = await blogsQueryRepository.findAndMap(req.params.id);
        res.status(200).json(blog)
    },

    async getBlogs(req: Request, res: Response<BlogsSortViewModel>) {
        const blogs = await blogsQueryRepository.getAll(req.query);
        res.status(200).json(blogs)
    },

    async getPostsInBlog(req: Request/*<ParamType, {}, {}, SortQueryType>*/, res: Response/*<BlogPostFilterViewModel>*/) {
        const sortedPosts: PostsSortViewModel = await blogsQueryRepository.sortPostsInBlog(req.params.id, req.query)
        res.status(200).json(sortedPosts)
    },
}