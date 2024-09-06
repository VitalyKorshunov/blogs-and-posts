import {Request, Response} from 'express'
import {BlogInputModel} from '../../../input-output-types/blogs-types'
import {blogsRepository} from '../blogsRepositoryMongoDb'

export const putBlogController = async (req: Request<{id: string}, any, BlogInputModel>, res: Response) => {
    await blogsRepository.put(req.body, req.params.id)
    res.sendStatus(204)
}