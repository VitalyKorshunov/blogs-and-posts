import {Request, Response} from 'express';
import {PostInputModel, PostsSortViewModel, PostViewModel} from '../../../input-output-types/posts-types';
import {postsService} from '../domain/posts-service';
import {ParamType} from '../../blogs/some';
import {postsQueryRepository} from '../repositories/postsQueryRepository';

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


}