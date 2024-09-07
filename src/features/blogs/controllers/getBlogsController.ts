import {Request, Response} from 'express'
import {BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsService} from '../domain/blogs-service';

export const getBlogsController = async (req: Request, res: Response<BlogViewModel[]>) => {
    const blogs = await blogsService.getAll();
    res.status(200).json(blogs)
}