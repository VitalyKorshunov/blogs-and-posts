import {Request, Response} from 'express'
import {blogsService} from '../domain/blogs-service';

export const delBlogController = async (req: Request<{ id: string }>, res: Response) => {
    await blogsService.del(req.params.id)
    res.sendStatus(204)
}