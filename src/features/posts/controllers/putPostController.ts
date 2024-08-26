import {Request, Response} from 'express'
import {PostInputModel} from '../../../input-output-types/posts-types'
import {postsRepository} from '../postsRepository'

export const putPostController = (req: Request<{id: string}, any, PostInputModel>, res: Response) => {

}