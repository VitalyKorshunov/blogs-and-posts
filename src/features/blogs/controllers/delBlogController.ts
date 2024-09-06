import {Request, Response} from 'express'
import {blogsRepository} from '../blogsRepositoryMongoDb'

export const delBlogController = async (req: Request<{ id: string }>, res: Response) => {
    await blogsRepository.del(req.params.id)
    res.sendStatus(204)
}