import {body} from 'express-validator'
import {inputCheckErrorsMiddleware} from '../../../global-middlewares/inputCheckErrorsMiddleware'

export const loginOrEmailValidator = body('loginOrEmail').isString().withMessage('Field must be a string').trim()
    .custom((loginOrEmail, {req}) => {
        if (loginOrEmail.includes('@')) {
            return body('loginOrEmail').matches(/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage('Incorrect email').run(req);
        } else {
            return body('loginOrEmail')
                .isLength({min: 3, max: 10}).withMessage('Login must be between 3 and 10 characters')
                .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Incorrect login').run(req);
        }
    })

export const passwordValidator = body('password').isString().withMessage('not string').trim()
    .isLength({min: 6, max: 20}).withMessage('more than 20 or less than 6')


export const authenticateUserValidators = [
    loginOrEmailValidator,
    passwordValidator,

    inputCheckErrorsMiddleware,
]