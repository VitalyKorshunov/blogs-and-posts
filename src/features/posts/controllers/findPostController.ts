import {Request, Response} from 'express'
import {PostViewModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepositoryMongoDb'

export const findPostController = async (req: Request<{id: string}>, res: Response<PostViewModel | {}>) => {
    const post = await postsRepository.findAndMap(req.params.id)

    res.status(200).json(post)
}