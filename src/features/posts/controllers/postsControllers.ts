import {Request, Response} from 'express';
import {PostInputModel, PostsSortViewModel, PostViewModel} from '../../../types/entities/posts-types';
import {postsService} from '../domain/posts-service';
import {postsQueryRepository} from '../repositories/postsQueryRepository';
import {ParamType} from '../../../types/request-response/request-types';
import {CommentInputModel, CommentsSortViewModel, CommentViewModel} from '../../../types/entities/comments-types';
import {commentsService} from '../../comments/domain/comments-service';
import {commentsQueryRepository} from '../../comments/repositories/commentsQueryRepository';

export const postsControllers = {
    async createPost(req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) {
        const newPostId = await postsService.create(req.body)
        const newPost = await postsQueryRepository.findAndMap(newPostId)
        res
            .status(201)
            .json(newPost)
    },

    async delPost(req: Request<ParamType>, res: Response) {
        await postsService.del(req.params.id)
        res
            .sendStatus(204)
    },

    async findPost(req: Request<ParamType>, res: Response<PostViewModel>) {
        const post = await postsQueryRepository.findAndMap(req.params.id)
        res
            .status(200)
            .json(post)
    },

    async getPosts(req: Request, res: Response<PostsSortViewModel>) {
        const posts = await postsQueryRepository.getAll(req.query);
        res
            .status(200)
            .json(posts)
    },
    async putPost(req: Request<ParamType, any, PostInputModel>, res: Response) {
        await postsService.put(req.body, req.params.id)
        res
            .sendStatus(204)
    },
    async getCommentsInPost(req: Request<ParamType>, res: Response<CommentsSortViewModel>) {
        const comments = await commentsQueryRepository.getAll(req.params.id, req.query)

        res.status(200).json(comments)
    },
    async createCommentInPost(req: Request<ParamType, {}, CommentInputModel>, res: Response<CommentViewModel>) {
        console.log(req.body)
        const commentId = await commentsService.create(req.params.id, req.user!.id, req.body)

        if (commentId === null) {
            res.sendStatus(404)
            return
        }

        const comment = await commentsQueryRepository.findAndMap(commentId)

        if (comment) {
            res.status(201).json(comment)
        }
    }
}