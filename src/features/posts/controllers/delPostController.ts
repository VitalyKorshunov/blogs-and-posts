import {Request, Response} from 'express'
import {postsRepository} from '../postsRepository'

export const delPostController = (req: Request<{id: string}>, res: Response) => {
    postsRepository.del(req.params.id)

    res.sendStatus(204)
}