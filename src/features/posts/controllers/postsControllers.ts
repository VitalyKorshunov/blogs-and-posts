import {Request, Response} from 'express';
import {PostId, PostInputModel, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {ParamType} from '../../../types/request-response/request-types';
import {
    CommentId,
    CommentInputModel,
    CommentsSortViewModel,
    CommentViewModel
} from '../../../types/entities/comments-types';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsService} from '../domain/posts-service';
import {PostsQueryRepository} from '../repositories/postsQueryRepository';
import {CommentsService} from '../../comments/domain/comments-service';
import {CommentsQueryRepository} from '../../comments/repositories/commentsQueryRepository';
import {accessTokenUtils} from '../../../common/utils/accessToken.utils';
import {UserId} from '../../../types/entities/users-types';
import {inject, injectable} from 'inversify';

@injectable()
export class PostsControllers {
    constructor(
        @inject(PostsService) protected postsService: PostsService,
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository,
        @inject(CommentsService) protected commentsService: CommentsService,
        @inject(CommentsQueryRepository) protected commentsQueryRepository: CommentsQueryRepository
    ) {
    }

    async createPost(req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) {
        const result = await this.postsService.createPostInBlog(req.body)

        if (result.statusCode === StatusCode.Success) {
            const postId = result.data
            const newPost = await this.postsQueryRepository.findPostById(postId)

            res.status(201).json(newPost)
        } else {
            res.sendStatus(400)
        }
    }

    async delPost(req: Request<ParamType>, res: Response) {
        const result = await this.postsService.deletePost(req.params.id)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(500)
        }
    }

    async findPost(req: Request<ParamType>, res: Response<PostViewModel>) {
        const post = await this.postsQueryRepository.findPostById(req.params.id)

        res.status(200).json(post)
    }

    async getPosts(req: Request, res: Response<PostsSortViewModel>) {
        const posts = await this.postsQueryRepository.getAllSortedPosts(req.query);

        res.status(200).json(posts)
    }

    async updatePost(req: Request<ParamType, any, PostInputModel>, res: Response) {
        const result = await this.postsService.updatePost(req.body, req.params.id)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else {
            res.sendStatus(404)
        }
    }

    async getCommentsInPost(req: Request<ParamType>, res: Response<CommentsSortViewModel>) {
        const userId = await accessTokenUtils.getAccessTokenUserId(req)
        const comments = await this.commentsQueryRepository.findAllCommentsForPost(req.params.id, req.query, userId)

        res.status(200).json(comments)
    }

    async createCommentInPost(req: Request<ParamType, {}, CommentInputModel>, res: Response<CommentViewModel>) {
        const postId: PostId = req.params.id
        const userId: UserId = req.user!.id
        const inputComment: CommentInputModel = req.body
        const result = await this.commentsService.createComment(postId, userId, inputComment)

        if (result.statusCode !== StatusCode.Success) {
            res.sendStatus(404)
            return
        }

        const commentId: CommentId = result.data

        const comment = await this.commentsQueryRepository.findCommentById(commentId, userId)

        if (comment) {
            res.status(201).json(comment)
        } else {
            res.sendStatus(500)
        }
    }

    async updateUserLikeStatusForPost(req: Request, res: Response) {

    };
}