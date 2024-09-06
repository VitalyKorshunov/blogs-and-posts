import {Request, Response} from 'express'
import {PostViewModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepositoryMongoDb'

export const getPostsController = async (req: Request, res: Response<PostViewModel[]>) => {
    const posts = await postsRepository.getAll();

    res.status(200).json(posts)
}