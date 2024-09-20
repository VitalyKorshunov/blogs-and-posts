import {body, query} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'
import {adminMiddleware} from '../../../global-middlewares/admin-middleware'
import {ObjectId} from 'mongodb';
import {NextFunction, Request, Response} from 'express';
import {UserDbType} from '../../../db/user-db-type';
import {usersQueryRepository} from '../repositories/usersQueryRepository';


export const loginValidator = body('login').isString().withMessage('not string').trim()
    .isLength({
        min: 3,
        max: 10
    }).withMessage('more than 10 or less than 3').matches(/^[a-zA-Z0-9_-]*$/).withMessage('Incorrect login')

export const passwordValidator = body('password').isString().withMessage('not string').trim()
    .isLength({min: 6, max: 20}).withMessage('more than 20 or less than 6')

export const emailValidator = body('email').isString().withMessage('not string').trim()
    .matches(/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Incorrect email')


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

export const findUserValidator = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.status(404).json({})
        return
    }

    const user: UserDbType | null = await usersQueryRepository.find(req.params.id)

    if (user) {
        next()
    } else {
        res
            .status(404)
            .json({})
        return
    }
}

export const usersValidators = [
    adminMiddleware,

    loginValidator,
    emailValidator,
    passwordValidator,

    inputCheckErrorsMiddleware,
]

export const sortUsersValidators = [
    pageNumberValidator,
    pageSizeValidator,
    sortByValidator,
    sortDirectionValidator,
]