import {Request, Response} from 'express';
import {
    PostId,
    PostIdParamModel,
    PostInputModel,
    PostLikeStatusInputModel,
    PostsSortViewModel,
    PostViewModel
} from '../../../types/entities/posts-types';
import {ParamType} from '../../../types/request-response/request-types';
import {
    CommentId,
    CommentInputModel,
    CommentsSortViewModel,
    CommentViewModel
} from '../../../types/entities/comments-types';
import {StatusCode} from '../../../common/utils/errorsAndStatusCodes.utils';
import {PostsService} from '../application/postsService';
import {PostsQueryRepository} from '../infrastructure/postsQueryRepository';
import {CommentsService} from '../../comments/application/commentsService';
import {CommentsQueryRepository} from '../../comments/repositories/commentsQueryRepository';
import {accessTokenUtils} from '../../../common/utils/accessToken.utils';
import {UserId} from '../../../types/entities/users-types';
import {inject, injectable} from 'inversify';
import {OneOfLikeStatus} from '../../../types/db/comments-db-types';

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
        const {title, shortDescription, content, blogId} = req.body

        const post: PostInputModel = {
            title, shortDescription, content, blogId
        }

        const result = await this.postsService.createPostInBlog(post)

        if (result.statusCode === StatusCode.Success) {
            const postId = result.data
            const userId: UserId | null = await accessTokenUtils.getAccessTokenUserId(req)
            const newPost = await this.postsQueryRepository.findPostById(postId, userId)

            res.status(201).json(newPost)
        } else if (result.statusCode === StatusCode.NotFound) {
            res.sendStatus(404)
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
        const userId: UserId | null = await accessTokenUtils.getAccessTokenUserId(req)
        const post = await this.postsQueryRepository.findPostById(req.params.id, userId)

        res.status(200).json(post)
    }

    async getPosts(req: Request, res: Response<PostsSortViewModel>) {
        const userId: UserId | null = await accessTokenUtils.getAccessTokenUserId(req)

        const posts = await this.postsQueryRepository.getAllSortedPosts(req.query, userId);

        res.status(200).json(posts)
    }

    async updatePost(req: Request<ParamType, any, PostInputModel>, res: Response) {
        const {title, shortDescription, content, blogId} = req.body
        const updatedPost: PostInputModel = {
            title, shortDescription, content, blogId
        }

        const result = await this.postsService.updatePost(updatedPost, req.params.id)

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

    async updateUserLikeStatusForPost(req: Request<PostIdParamModel, {}, PostLikeStatusInputModel>, res: Response) {
        const postId: PostId = req.params.id
        const userId: UserId = req.user!.id
        const likeStatus: OneOfLikeStatus = req.body.likeStatus

        const result = await this.postsService.updatePostLikeStatus(postId, userId, likeStatus)

        if (result.statusCode === StatusCode.Success) {
            res.sendStatus(204)
        } else if (result.statusCode === StatusCode.NotFound) {
            res.sendStatus(404)
        } else {
            res.sendStatus(500)
        }
    };
}