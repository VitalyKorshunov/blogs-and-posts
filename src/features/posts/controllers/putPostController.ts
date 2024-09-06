import {Request, Response} from 'express'
import {PostInputModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepositoryMongoDb'

export const putPostController = async (req: Request<{id: string}, any, PostInputModel>, res: Response) => {
    await postsRepository.put(req.body, req.params.id)

    res.sendStatus(204)
}