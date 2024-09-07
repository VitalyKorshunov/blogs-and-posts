import {Request, Response} from 'express'
import {PostViewModel} from '../../../input-output-types/posts-types'
import {postsService} from '../domain/posts-service';

export const getPostsController = async (req: Request, res: Response<PostViewModel[]>) => {
    const posts = await postsService.getAll();

    res.status(200).json(posts)
}