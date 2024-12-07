import {Request, Response} from 'express';
import {
    BlogInputModel,
    BlogsSortViewModel,
    BlogViewModel,
    PostsForBlogSortViewModel
} from '../../../types/entities/blogs-types';
import {BlogsService} from '../../../application/blogs-service';
import {BlogPostInputModel, PostId, PostInputModel, PostViewModel} from '../../../types/entities/posts-types';
import {ParamType} from '../../../types/request-response/request-types';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {BlogsQueryRepository} from '../../../infrastructure/blogRepositories/blogsQueryRepository';
import {PostsService} from '../../../application/posts-service';
import {PostsQueryRepository} from '../../../infrastructure/postRepositories/postsQueryRepository';
import {inject, injectable} from 'inversify';

@injectable()
export class BlogsControllers {
    constructor(
        @inject(BlogsService) protected blogsService: BlogsService,
        @inject(BlogsQueryRepository) protected blogsQueryRepository: BlogsQueryRepository,
        @inject(PostsService) protected postsService: PostsService,
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository
    ) {
    }

    async createBlog(req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) {
        const newBlogId = await this.blogsService.createBlog(req.body)

        const newBlog = await this.blogsQueryRepository.findAndMap(newBlogId)

        if (newBlog.statusCode === StatusCode.Success) {
            res
                .status(201)
                .json(newBlog.data)
        } else {
            res.sendStatus(404)
        }
    }

    async createPostInBlog(req: Request<ParamType, {}, BlogPostInputModel>, res: Response<PostViewModel>) {
        const post: PostInputModel = {
            title: req.body.title,
            content: req.body.content,
            blogId: req.params.id,
            shortDescription: req.body.shortDescription
        }

        const result = await this.postsService.createPostInBlog(post)

        if (result.statusCode === StatusCode.Success) {
            const postId: PostId = result.data

            const post: PostViewModel = await this.postsQueryRepository.findPostById(postId)
            res
                .status(201)
                .json(post)
        } else {
            res.sendStatus(404)
        }
    }

    async updateBlog(req: Request<ParamType, any, BlogInputModel>, res: Response) {
        await this.blogsService.updateBlog(req.body, req.params.id)

        res.sendStatus(204)
    }

    async delBlog(req: Request<ParamType>, res: Response) {
        await this.blogsService.deleteBlog(req.params.id)
        res.sendStatus(204)
    }

    async findBlog(req: Request<ParamType>, res: Response<BlogViewModel | {}>) {
        const blog = await this.blogsQueryRepository.findAndMap(req.params.id);

        if (blog.statusCode === StatusCode.Success) {
            res.status(200).json(blog.data)
        }
    }

    async getBlogs(req: Request, res: Response<BlogsSortViewModel>) {
        const blogs = await this.blogsQueryRepository.getAllSortedBlogs(req.query);
        res.status(200).json(blogs)
    }

    async getPostsInBlog(req: Request/*<ParamType, {}, {}, SortQueryType>*/, res: Response<PostsForBlogSortViewModel>/*<BlogPostFilterViewModel>*/) {
        const result = await this.blogsQueryRepository.getSortedPostsInBlog(req.params.id, req.query)

        if (result.statusCode === StatusCode.Success) {
            const sortedPostsInBlog: PostsForBlogSortViewModel = result.data
            res.status(200).json(sortedPostsInBlog)
        } else {
            res.sendStatus(404)
        }
    }
}