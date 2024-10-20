import {Response} from 'express';
import {ErrorsType} from '../../types/utils/output-errors-type';

export class ExecutionStatus {
    constructor(public statusCode: StatusCode, public data?: any) {
    }
}

export enum StatusCode {
    NotFound = 'NotFound',
    ErrorSendEmail = 'error send email',
    Success = 'Success',
    Invalid = 'Invalid',
    BadRequest = 'BadRequest',
}

export enum StatusesCode {
    Success,
    NotFound,
    InvalidCredentials,
    TokenError,
    LoginOrEmailError,
    EmailError,
    PermissionDenied
}

type ResultSuccess<T> = {
    statusCode: StatusesCode.Success
    data: T
}
type ResultNotFound = {
    statusCode: StatusesCode.NotFound
    errorMessage: string
    data?: ErrorsType
}

type ResultInvalidCredentials = {
    statusCode: StatusesCode.InvalidCredentials
    errorMessage: string
}

type ResultTokenError = {
    statusCode: StatusesCode.TokenError
    errorMessage: string
}

type ResultLoginOrEmailError = {
    statusCode: StatusesCode.LoginOrEmailError
    message: string
    date?: ErrorsType
}

type ResultEmailError = {
    statusCode: StatusesCode.EmailError
    errorMessage: string
    data?: ErrorsType
}

type PermissionDeniedError = {
    statusCode: StatusesCode.PermissionDenied
    errorMessage: string
}


export type ResultType<T> =
    ResultSuccess<T>
    | ResultNotFound
    | ResultInvalidCredentials
    | ResultTokenError
    | ResultLoginOrEmailError
    | ResultEmailError
    | PermissionDeniedError

export const result = {
    success<T>(data: T): ResultSuccess<T> {
        return {
            statusCode: StatusesCode.Success,
            data
        }
    },
    notFound(errorMessage: string, error?: ErrorsType): ResultNotFound {
        return {
            statusCode: StatusesCode.NotFound,
            errorMessage,
            data: error
        }
    },
    invalidCredentials(errorMessage: string): ResultInvalidCredentials {
        return {
            statusCode: StatusesCode.InvalidCredentials,
            errorMessage
        }
    },
    tokenError(errorMessage: string): ResultTokenError {
        return {
            statusCode: StatusesCode.TokenError,
            errorMessage
        }
    },
    loginOrEmailWithError(message: string, date: ErrorsType): ResultLoginOrEmailError {
        return {
            statusCode: StatusesCode.LoginOrEmailError,
            message,
            date
        }
    },
    emailError(errorMessage: string, data?: ErrorsType): ResultEmailError {
        return {
            statusCode: StatusesCode.EmailError,
            errorMessage,
            data
        }
    },
    permissionDeniedError(errorMessage: string): PermissionDeniedError {
        return {
            statusCode: StatusesCode.PermissionDenied,
            errorMessage
        }
    }
}

export const handleError = (result: ResultType<unknown>, res: Response) => {
    switch (result.statusCode) {
        case StatusesCode.NotFound: {
            console.error(result.errorMessage)
            res.status(400).json(result.data ?? {})
            break
        }
        case StatusesCode.InvalidCredentials:
        case StatusesCode.TokenError: {
            console.error(result.errorMessage)
            res.sendStatus(401)
            break
        }

        case StatusesCode.LoginOrEmailError: {
            console.log(result.message)
            res.status(400).json(result.date || {})
            break
        }
        case StatusesCode.EmailError: {
            console.error(result.errorMessage)
            res.status(400).json(result.data ?? {})
            break
        }
        case StatusesCode.PermissionDenied: {
            res.sendStatus(403)
            break
        }
        default: {
            console.error('some uncaught error')
            res.sendStatus(520)
        }
    }
}