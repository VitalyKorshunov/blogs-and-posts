import {Request, Response} from 'express'
import {BlogInputModel, BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsService} from '../domain/blogs-service';

export const createBlogController = async (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) => {
    const newBlogId = await blogsService.create(req.body)
    const newBlog = await blogsService.findAndMap(newBlogId)

    res
        .status(201)
        .json(newBlog)
}