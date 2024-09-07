import {Request, Response} from 'express'
import {PostViewModel} from '../../../input-output-types/posts-types'
import {postsService} from '../domain/posts-service';

export const findPostController = async (req: Request<{id: string}>, res: Response<PostViewModel | {}>) => {
    const post = await postsService.findAndMap(req.params.id)

    res.status(200).json(post)
}