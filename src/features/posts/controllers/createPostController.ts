import {Response, Request} from 'express'
import {PostInputModel, PostViewModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepositoryMongoDb'

export const createPostController = async (req: Request<any, any, PostInputModel>, res: Response<PostViewModel>) => {
    const newPostId = await postsRepository.create(req.body)
    const newPost = await postsRepository.findAndMap(newPostId)

    res
        .status(201)
        .json(newPost)
}