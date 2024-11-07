import {Request, Response} from 'express';
import {PostInputModel, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {ParamType} from '../../../types/request-response/request-types';
import {CommentInputModel, CommentsSortViewModel, CommentViewModel} from '../../../types/entities/comments-types';
import {StatusesCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsService} from '../domain/posts-service';
import {PostsQueryRepository} from '../repositories/postsQueryRepository';
import {CommentsService} from '../../comments/domain/comments-service';
import {CommentsQueryRepository} from '../../comments/repositories/commentsQueryRepository';

export class PostsControllers {
    private postsService: PostsService
    private postsQueryRepository: PostsQueryRepository
    private commentsService: CommentsService
    private commentsQueryRepository: CommentsQueryRepository

    constructor() {
        this.postsService = new PostsService()
        this.postsQueryRepository = new PostsQueryRepository()
        this.commentsService = new CommentsService()
        this.commentsQueryRepository = new CommentsQueryRepository()
    }

    async createPost(req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) {
        const newPostId = await this.postsService.createPostInBlog(req.body)

        if (newPostId.statusCode === StatusesCode.Success) {
            const newPost = await this.postsQueryRepository.findAndMap(newPostId.data)
            res
                .status(201)
                .json(newPost)
        } else {
            res.sendStatus(400)
        }

    }

    async delPost(req: Request<ParamType>, res: Response) {
        await this.postsService.deletePost(req.params.id)
        res
            .sendStatus(204)
    }

    async findPost(req: Request<ParamType>, res: Response<PostViewModel>) {
        const post = await this.postsQueryRepository.findAndMap(req.params.id)
        res
            .status(200)
            .json(post)
    }

    async getPosts(req: Request, res: Response<PostsSortViewModel>) {
        const posts = await this.postsQueryRepository.getAllSortedPosts(req.query);
        res
            .status(200)
            .json(posts)
    }

    async updatePost(req: Request<ParamType, any, PostInputModel>, res: Response) {
        await this.postsService.updatePost(req.body, req.params.id)
        res
            .sendStatus(204)
    }

    async getCommentsInPost(req: Request<ParamType>, res: Response<CommentsSortViewModel>) {
        const comments = await this.commentsQueryRepository.getAll(req.params.id, req.query)

        res.status(200).json(comments)
    }

    async createCommentInPost(req: Request<ParamType, {}, CommentInputModel>, res: Response<CommentViewModel>) {
        const commentId = await this.commentsService.createComment(req.params.id, req.user!.id, req.body)

        if (commentId === null) {
            res.sendStatus(404)
            return
        }

        const comment = await this.commentsQueryRepository.findAndMap(commentId)

        if (comment) {
            res.status(201).json(comment)
        }
    }
}