import {Request, Response} from 'express'
import {BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsRepository} from '../blogsRepositoryMongoDb'

export const findBlogController = async (req: Request<{ id: string }>, res: Response<BlogViewModel | {}>) => {
    const blog = await blogsRepository.findAndMap(req.params.id);
    res.status(200).json(blog)
}