import {Request, Response} from 'express'
import {BlogInputModel} from '../../../input-output-types/blogs-types'
import {blogsService} from '../domain/blogs-service';

export const putBlogController = async (req: Request<{id: string}, any, BlogInputModel>, res: Response) => {
    await blogsService.put(req.body, req.params.id)
    res.sendStatus(204)
}