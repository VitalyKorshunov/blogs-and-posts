import {body} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {NextFunction, Request, Response} from 'express'
import {adminMiddleware} from '../../../global-middlewares/admin-middleware'
import {ObjectId} from 'mongodb';
import {blogsService} from '../../blogs/domain/blogs-service';
import {postsService} from '../domain/posts-service';
import {PostDbType} from '../../../db/post-db-type';
import {BlogDbType} from '../../../db/blog-db-type';

export const titleValidator = body('title').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 30}).withMessage('more than 30 or 0')
export const shortDescriptionValidator = body('shortDescription').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 100}).withMessage('more than 100 or 0')
export const contentValidator = body('content').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 1000}).withMessage('more then 1000 or 0')
export const blogIdValidator = body('blogId').isString().withMessage('not string').trim()
    .custom(async (blogId: string) => {
        if (!ObjectId.isValid(blogId)) throw new Error('invalid id')
        const blog: BlogDbType | null = await blogsService.find(blogId)
        if (!blog) throw new Error('no blog')
    })

export const findPostValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({})
        return
    }

    const post: PostDbType | null = await postsService.find(req.params.id)

    if (post) {
        next()
    } else {
        res
            .status(404)
            .json({})
        return
    }
}

export const postValidators = [
    adminMiddleware,

    titleValidator,
    shortDescriptionValidator,
    contentValidator,
    blogIdValidator,

    inputCheckErrorsMiddleware,
]