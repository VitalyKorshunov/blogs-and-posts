import {Request, Response} from 'express';
import {
    BlogInputModel,
    BlogPostFilterViewModel,
    BlogsSortViewModel,
    BlogViewModel
} from '../../../input-output-types/blogs-types';
import {blogsService} from '../domain/blogs-service';
import {BlogPostInputModel, PostId, PostViewModel} from '../../../input-output-types/posts-types';
import {postsService} from '../../posts/domain/posts-service';
import {blogsQueryRepository} from '../repositories/blogsQueryRepository';

export const blogsControllers = {
    async createBlog(req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) {
        const newBlogId = await blogsService.create(req.body)
        const newBlog = await blogsService.findAndMap(newBlogId)
        res
            .status(201)
            .json(newBlog)
    },

    async createPostInBlog(req: Request<{ id: string }, {}, BlogPostInputModel>, res: Response<PostViewModel>) {
        const postId: PostId = await blogsService.createPostForBlog(req.params.id, req.body)
        const post: PostViewModel = await postsService.findAndMap(postId)
        res
            .status(201)
            .json(post)
    },

    async putBlog(req: Request<{ id: string }, any, BlogInputModel>, res: Response) {
        await blogsService.put(req.body, req.params.id)
        res.sendStatus(204)
    },

    async delBlog(req: Request<{ id: string }>, res: Response) {
        await blogsService.del(req.params.id)
        res.sendStatus(204)
    },

    async findBlog(req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) {
        const blog = await blogsService.findAndMap(req.params.id);
        res.status(200).json(blog)
    },

    async getBlogs(req: Request, res: Response<BlogsSortViewModel>) {
        const blogs = await blogsQueryRepository.getAll(req.query);
        res.status(200).json(blogs)
    },

    async getSortedPostsInBlog(req: Request/*<ParamType, {}, {}, SortQueryType>*/, res: Response/*<BlogPostFilterViewModel>*/) {
        const sortedPosts: BlogPostFilterViewModel = await blogsService.sortPostsInBlog(req.params.id, req.query)
        res.status(200).json(sortedPosts)
    },
}