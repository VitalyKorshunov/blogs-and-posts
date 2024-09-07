import {body} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {NextFunction, Request, Response} from 'express'
import {adminMiddleware} from '../../../global-middlewares/admin-middleware'
import {ObjectId} from 'mongodb';
import {blogsService} from '../domain/blogs-service';
import {BlogDbType} from '../../../db/blog-db-type';

export const nameValidator = body('name').isString().withMessage('not string').trim()
    .isLength({min: 1, max: 15}).withMessage('more than 15 or 0')
export const descriptionValidator = body('description').isString().withMessage('not string')
    .trim().isLength({min: 1, max: 500}).withMessage('more then 500 or 0')
export const websiteUrlValidator = body('websiteUrl').isString().withMessage('not string')
    .trim().isURL().withMessage('not url')
    .isLength({min: 1, max: 100}).withMessage('more then 100 or 0')
export const findBlogValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({error: 'invalid id'})
        return
    }

    const post: BlogDbType | null = await blogsService.find(req.params.id)

    if (post) {
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