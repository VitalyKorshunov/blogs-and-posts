import {Request, Response} from 'express'
import {PostInputModel} from '../../../input-output-types/posts-types'
import {postsService} from '../domain/posts-service';

export const putPostController = async (req: Request<{id: string}, any, PostInputModel>, res: Response) => {
    await postsService.put(req.body, req.params.id)

    res.sendStatus(204)
}