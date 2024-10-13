import {Request, Response} from 'express';
import {
    BlogInputModel,
    BlogsSortViewModel,
    BlogViewModel,
    PostsForBlogSortViewModel
} from '../../../types/entities/blogs-types';
import {blogsService} from '../domain/blogs-service';
import {BlogPostInputModel, PostId, PostInputModel, PostViewModel} from '../../../types/entities/posts-types';
import {blogsQueryRepository} from '../repositories/blogsQueryRepository';
import {postsQueryRepository} from '../../posts/repositories/postsQueryRepository';
import {ParamType} from '../../../types/request-response/request-types';
import {StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {postsService} from '../../posts/domain/posts-service';

export const blogsControllers = {
    async createBlog(req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) {
        const newBlogId = await blogsService.createBlog(req.body)

        const newBlog = await blogsQueryRepository.findAndMap(newBlogId)

        if (newBlog.statusCode === StatusesCode.Success) {
            res
                .status(201)
                .json(newBlog.data)
        } else {
            res.sendStatus(404)
        }
    },

    async createPostInBlog(req: Request<ParamType, {}, BlogPostInputModel>, res: Response<PostViewModel>) {
        const post: PostInputModel = {
            title: req.body.title,
            content: req.body.content,
            blogId: req.params.id,
            shortDescription: req.body.shortDescription
        }

        const result = await postsService.createPostInBlog(post)

        if (result.statusCode === StatusesCode.Success) {
            const postId: PostId = result.data

            const post: PostViewModel = await postsQueryRepository.findAndMap(postId)
            res
                .status(201)
                .json(post)
        } else {
            res.sendStatus(404)
        }


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

        if(blog.statusCode === StatusesCode.Success) {
            res.status(200).json(blog.data)
        }
    },

    async getBlogs(req: Request, res: Response<BlogsSortViewModel>) {
        const blogs = await blogsQueryRepository.getAllSortedBlogs(req.query);
        res.status(200).json(blogs)
    },

    async getPostsInBlog(req: Request/*<ParamType, {}, {}, SortQueryType>*/, res: Response<PostsForBlogSortViewModel>/*<BlogPostFilterViewModel>*/) {
        const result = await blogsQueryRepository.getSortedPostsInBlog(req.params.id, req.query)

        if (result.statusCode === StatusesCode.Success) {
            const sortedPostsInBlog: PostsForBlogSortViewModel = result.data
            res.status(200).json(sortedPostsInBlog)
        } else {
            res.sendStatus(404)
        }
    },
}