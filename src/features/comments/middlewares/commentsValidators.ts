import {body, query} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {NextFunction, Request, Response} from 'express'
import {ObjectId} from 'mongodb';
import {accessTokenGuardMiddleware} from '../../../global-middlewares/accessTokenGuard-middleware';
import {CommentsQueryRepository} from '../repositories/commentsQueryRepository';
import {LikeStatus} from '../../../types/db/comments-db-types';


export const commentContentValidator = body('content').isString().withMessage('not string').trim()
    .isLength({min: 20, max: 300}).withMessage('more than 300 or less than 20')

export const likeStatusValidator = body('likeStatus').isString().withMessage('not string').trim()
    .isIn(Object.values(LikeStatus)).withMessage('invalid value')

export const findCommentValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({})
        return
    }

    const commentsQueryRepository = new CommentsQueryRepository()
    const isCommentFound = await commentsQueryRepository.isCommentFound(req.params.id)

    if (isCommentFound) {
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

export const updateCommentsValidators = [
    accessTokenGuardMiddleware,

    findCommentValidator,
    commentContentValidator,

    inputCheckErrorsMiddleware,
]


export const findCommentValidators = [
    findCommentValidator,

    inputCheckErrorsMiddleware
]

export const deleteCommentsValidators = [
    accessTokenGuardMiddleware,

    findCommentValidator,

    inputCheckErrorsMiddleware
]

export const likeStatusCommentsValidators = [
    accessTokenGuardMiddleware,

    findCommentValidator,
    likeStatusValidator,

    inputCheckErrorsMiddleware
]