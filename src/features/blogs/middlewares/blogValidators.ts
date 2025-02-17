import {body, query} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {NextFunction, Request, Response} from 'express'
import {adminMiddleware} from '../../../global-middlewares/admin-middleware'
import {ObjectId} from 'mongodb';
import {contentValidator, shortDescriptionValidator, titleValidator} from '../../posts/middlewares/postValidators';
import {BlogsQueryRepository} from '../infrastructure/blogsQueryRepository';
import {container} from '../../composition-root';

export const nameValidator = body('name').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 15}).withMessage('more than 15 or 0')

export const descriptionValidator = body('description').isString().withMessage('not string')
    .trim().isLength({min: 1, max: 500}).withMessage('more then 500 or 0')

export const websiteUrlValidator = body('websiteUrl').isString().withMessage('not string')
    .trim().matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$').withMessage('not url')
    .isLength({min: 1, max: 100}).withMessage('more then 100 or 0')

export const pageNumberValidator = query('pageNumber').default(1).toInt()
    .customSanitizer(pageNumber => {
        return (isNaN(pageNumber)) ? 1 : pageNumber
    })

export const pageSizeValidator = query('pageSize').default(10).toInt()
    .customSanitizer(pageSize => {
        return (isNaN(pageSize) || pageSize > 100) ? 10 : pageSize
    })

export const sortByValidator = query('sortBy').default('createdAt').trim()

export const sortDirectionValidator = query('sortDirection').default('desc')
    .trim().toLowerCase().customSanitizer(sortDirection => {
        return (['desc', 'asc'].includes(sortDirection)) ? sortDirection : 'desc'
    })

export const findBlogValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({error: 'invalid id'})
        return
    }
    const blogsQueryRepository = container.resolve(BlogsQueryRepository)
    const isBlogFound: boolean = await blogsQueryRepository.isBlogFound(req.params.id)

    if (isBlogFound) {
        next()
    } else {
        res.sendStatus(404)
    }
}

export const blogValidators = [
    adminMiddleware,

    nameValidator,
    descriptionValidator,
    websiteUrlValidator,

    inputCheckErrorsMiddleware,
]

export const blogPostValidators = [
    adminMiddleware,

    findBlogValidator,

    titleValidator,
    shortDescriptionValidator,
    contentValidator,

    inputCheckErrorsMiddleware,
]

export const sortPostsInBlogValidators = [
    findBlogValidator,

    pageNumberValidator,
    pageSizeValidator,
    sortByValidator,
    sortDirectionValidator,

    inputCheckErrorsMiddleware,
]

export const sortBlogsValidators = [
    pageNumberValidator,
    pageSizeValidator,
    sortByValidator,
    sortDirectionValidator,

    inputCheckErrorsMiddleware,
]
