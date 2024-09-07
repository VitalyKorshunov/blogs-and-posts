import {Request, Response} from 'express'
import {postsService} from '../domain/posts-service';

export const delPostController = async (req: Request<{id: string}>, res: Response) => {
    await postsService.del(req.params.id)

    res.sendStatus(204)
}