import {Request, Response} from 'express'
import {PostViewModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepository'

export const findPostController = (req: Request<{id: string}>, res: Response<PostViewModel | {}>) => {
    const post = postsRepository.find(req.params.id)

    res.status(200).json(post)
}