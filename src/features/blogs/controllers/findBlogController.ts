import {Request, Response} from 'express'
import {BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsRepository} from '../blogsRepository'

export const findBlogController = (req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) => {
    const blog = blogsRepository.findAndMap(req.params.id);
    res.status(200).json(blog)
}