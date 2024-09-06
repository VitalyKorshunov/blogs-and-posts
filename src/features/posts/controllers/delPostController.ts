import {Request, Response} from 'express'
import {postsRepository} from '../postsRepositoryMongoDb'

export const delPostController = async (req: Request<{id: string}>, res: Response) => {
    await postsRepository.del(req.params.id)

    res.sendStatus(204)
}