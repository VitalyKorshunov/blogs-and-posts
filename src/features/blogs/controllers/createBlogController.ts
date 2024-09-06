import {Response, Request} from 'express'
import {BlogInputModel, BlogViewModel} from '../../../input-output-types/blogs-types'
import {blogsRepository} from '../blogsRepositoryMongoDb'

export const createBlogController = async (req: Request<any, any, BlogInputModel>, res: Response<BlogViewModel>) => {
    const newBlogId = await blogsRepository.create(req.body)
    const newBlog = await blogsRepository.findAndMap(newBlogId)

    res
        .status(201)
        .json(newBlog)
}