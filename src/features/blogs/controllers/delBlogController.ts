import {Request, Response} from 'express'
import {blogsRepository} from '../blogsRepository'

export const delBlogController = (req: Request<{ id: string }>, res: Response) => {
    blogsRepository.del(req.params.id)
    res.sendStatus(204)
}