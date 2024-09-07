import {Request, Response} from 'express'
import {BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsService} from '../domain/blogs-service';

export const findBlogController = async (req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) => {
    const blog = await blogsService.findAndMap(req.params.id);
    res.status(200).json(blog)
}