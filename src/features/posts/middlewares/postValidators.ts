import {body, query} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {NextFunction, Request, Response} from 'express'
import {adminMiddleware} from '../../../global-middlewares/admin-middleware'
import {ObjectId} from 'mongodb';
import {accessTokenGuardMiddleware} from '../../../global-middlewares/accessTokenGuard-middleware';
import {BlogsQueryRepository} from '../../../infrastructure/blogRepositories/blogsQueryRepository';
import {PostsQueryRepository} from '../repositories/postsQueryRepository';
import {likeStatusValidator} from '../../comments/middlewares/commentsValidators';

export const commentContentValidator = body('content').isString().withMessage('not string').trim()
    .isLength({min: 20, max: 300}).withMessage('more than 300 or less than 20')

export const titleValidator = body('title').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 30}).withMessage('more than 30 or 0')

export const shortDescriptionValidator = body('shortDescription').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 100}).withMessage('more than 100 or 0')

export const contentValidator = body('content').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 1000}).withMessage('more then 1000 or 0')

export const blogIdBodyValidator = body('blogId').isString().withMessage('not string').trim()
    .custom(async (blogId: string) => {
        if (!ObjectId.isValid(blogId)) throw new Error('invalid id')

        const blogsQueryRepository = new BlogsQueryRepository()
        const isBlogFound: boolean = await blogsQueryRepository.isBlogFound(blogId)

        if (!isBlogFound) throw new Error('no blog')
    })

export const findPostValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({})
        return
    }

    const postsQueryRepository = new PostsQueryRepository()
    const isPostFound = await postsQueryRepository.isPostFound(req.params.id)

    if (isPostFound) {
        next()
    } else {
        res
            .status(404)
            .json({})
        return
    }
}

const pageNumberValidator = query('pageNumber').default(1).toInt()
    .customSanitizer(pageNumber => {
        return (isNaN(pageNumber)) ? 1 : pageNumber
    })

const pageSizeValidator = query('pageSize').default(10).toInt()
    .customSanitizer(pageSize => {
        return (isNaN(pageSize) || pageSize > 100) ? 10 : pageSize
    })

const sortByValidator = query('sortBy').default('createdAt').trim()

const sortDirectionValidator = query('sortDirection').default('desc')
    .trim().toLowerCase().customSanitizer(sortDirection => {
        return (['desc', 'asc'].includes(sortDirection)) ? sortDirection : 'desc'
    })

export const createPostValidators = [
    adminMiddleware,

    titleValidator,
    shortDescriptionValidator,
    contentValidator,
    blogIdBodyValidator,

    inputCheckErrorsMiddleware,
]

export const getPostsValidators = [
    pageNumberValidator,
    pageSizeValidator,
    sortByValidator,
    sortDirectionValidator,

    inputCheckErrorsMiddleware,
]

export const createCommentInPostValidator = [
    accessTokenGuardMiddleware,

    findPostValidator,
    commentContentValidator,

    inputCheckErrorsMiddleware
]

export const likeStatusPostsValidators = [
    accessTokenGuardMiddleware,

    findPostValidator,
    likeStatusValidator,

    inputCheckErrorsMiddleware
]