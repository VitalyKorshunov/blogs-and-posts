import {Request, Response} from 'express'
import {PostInputModel, PostViewModel} from '../../../input-output-types/posts-types'
import {postsService} from '../domain/posts-service';

export const createPostController = async (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) => {
    const newPostId = await postsService.create(req.body)
    const newPost = await postsService.findAndMap(newPostId)

    res
        .status(201)
        .json(newPost)
}