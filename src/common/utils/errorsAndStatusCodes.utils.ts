import {Response} from 'express';
import {ErrorsType} from '../../types/utils/output-errors-type';

export enum StatusCode {
    Success,
    NotFound,
    InvalidCredentials,
    TokenError,
    LoginOrEmailError,
    EmailError,
    PermissionDenied,
    PasswordError,
    NotBelongToUser
}

type ResultSuccess<T> = {
    statusCode: StatusCode.Success
    data: T
}
type ResultNotFound = {
    statusCode: StatusCode.NotFound
    errorMessage: string
    data?: ErrorsType
}

type ResultInvalidCredentials = {
    statusCode: StatusCode.InvalidCredentials
    errorMessage: string
}

type ResultTokenError = {
    statusCode: StatusCode.TokenError
    errorMessage: string
}

type ResultLoginOrEmailError = {
    statusCode: StatusCode.LoginOrEmailError
    message: string
    date?: ErrorsType
}

type ResultEmailError = {
    statusCode: StatusCode.EmailError
    errorMessage: string
    data?: ErrorsType
}

type ResultPermissionDeniedError = {
    statusCode: StatusCode.PermissionDenied
    errorMessage: string
}

type ResultPasswordError = {
    statusCode: StatusCode.PasswordError
    errorMessage: string
    data?: ErrorsType
}

type ResultNotBelongToUserError = {
    statusCode: StatusCode.NotBelongToUser
    errorMessage: string
}


export type ResultType<T> =
    ResultSuccess<T>
    | ResultNotFound
    | ResultInvalidCredentials
    | ResultTokenError
    | ResultLoginOrEmailError
    | ResultEmailError
    | ResultPermissionDeniedError
    | ResultPasswordError
    | ResultNotBelongToUserError


export const result = {
    success<T>(data: T): ResultSuccess<T> {
        return {
            statusCode: StatusCode.Success,
            data
        }
    },
    notFound(errorMessage: string, error?: ErrorsType): ResultNotFound {
        return {
            statusCode: StatusCode.NotFound,
            errorMessage,
            data: error
        }
    },
    invalidCredentials(errorMessage: string): ResultInvalidCredentials {
        return {
            statusCode: StatusCode.InvalidCredentials,
            errorMessage
        }
    },
    tokenError(errorMessage: string): ResultTokenError {
        return {
            statusCode: StatusCode.TokenError,
            errorMessage
        }
    },
    loginOrEmailWithError(message: string, date: ErrorsType): ResultLoginOrEmailError {
        return {
            statusCode: StatusCode.LoginOrEmailError,
            message,
            date
        }
    },
    emailError(errorMessage: string, data?: ErrorsType): ResultEmailError {
        return {
            statusCode: StatusCode.EmailError,
            errorMessage,
            data
        }
    },
    permissionDeniedError(errorMessage: string): ResultPermissionDeniedError {
        return {
            statusCode: StatusCode.PermissionDenied,
            errorMessage
        }
    },
    passwordError(errorMessage: string, data?: ErrorsType): ResultPasswordError {
        return {
            statusCode: StatusCode.PasswordError,
            errorMessage,
            data
        }
    },
    notBelongToUser(errorMessage: string): ResultNotBelongToUserError {
        return {
            statusCode:StatusCode.NotBelongToUser,
            errorMessage
        }
    }
}

export const handleError = (result: ResultType<unknown>, res: Response) => {
    switch (result.statusCode) {
        case StatusCode.NotFound: {
            console.log(result.errorMessage)
            res.status(400).json(result.data ?? {})
            break
        }
        case StatusCode.InvalidCredentials:
        case StatusCode.TokenError: {
            console.log(result.errorMessage)
            res.sendStatus(401)
            break
        }

        case StatusCode.LoginOrEmailError: {
            console.log(result.message)
            res.status(400).json(result.date || {})
            break
        }
        case StatusCode.EmailError: {
            console.log(result.errorMessage)
            res.status(400).json(result.data ?? {})
            break
        }
        case StatusCode.PermissionDenied: {
            res.sendStatus(403)
            break
        }
        default: {
            console.error('some uncaught error')
            res.sendStatus(520)
        }
    }
}