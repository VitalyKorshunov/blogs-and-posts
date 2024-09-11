import {Request, Response} from 'express';
import {PostInputModel, PostViewModel} from '../../../input-output-types/posts-types';
import {postsService} from '../domain/posts-service';

export const postsControllers = {
    async createPost(req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) {
        const newPostId = await postsService.create(req.body)
        const newPost = await postsService.findAndMap(newPostId)
        res
            .status(201)
            .json(newPost)
    },

    async delPost(req: Request<{ id: string }>, res: Response) {
        await postsService.del(req.params.id)
        res
            .sendStatus(204)
    },

    async findPost(req: Request<{ id: string }>, res: Response<PostViewModel | {}>) {
        const post = await postsService.findAndMap(req.params.id)
        res
            .status(200)
            .json(post)
    },

    async getPosts(req: Request, res: Response<PostViewModel[]>) {
        const posts = await postsService.getAll();
        res
            .status(200)
            .json(posts)
    },

    async putPost(req: Request<{ id: string }, any, PostInputModel>, res: Response) {
        await postsService.put(req.body, req.params.id)
        res
            .sendStatus(204)
    },


}