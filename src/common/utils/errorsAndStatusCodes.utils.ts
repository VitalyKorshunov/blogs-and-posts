import {Response} from 'express';

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
    InvalidToken,
}

type ResultSuccess<T> = {
    statusCode: StatusesCode.Success
    data: T
}
type ResultNotFound = {
    statusCode: StatusesCode.NotFound
    errorMessage: string
}

type ResultInvalidCredentials = {
    statusCode: StatusesCode.InvalidCredentials
    errorMessage: string
}

type ResultInvalidToken = {
    statusCode: StatusesCode.InvalidToken
    errorMessage: string
}


export type ResultType<T> = ResultSuccess<T> | ResultNotFound | ResultInvalidCredentials | ResultInvalidToken

export const result = {
    success<T>(data: T): ResultSuccess<T> {
        return {
            statusCode: StatusesCode.Success,
            data
        }
    },
    notFound(errorMessage: string): ResultNotFound {
        return {
            statusCode: StatusesCode.NotFound,
            errorMessage
        }
    },
    invalidCredentials(errorMessage: string): ResultInvalidCredentials {
        return {
            statusCode: StatusesCode.InvalidCredentials,
            errorMessage
        }
    },
    invalidToken(errorMessage: string): ResultInvalidToken {
        return {
            statusCode: StatusesCode.InvalidToken,
            errorMessage
        }
    },
}

export const handleResult = <T>(result: ResultType<T>, res: Response) => {
    switch (result.statusCode) {
        case StatusesCode.NotFound: {
            console.error(result.errorMessage)
            res.sendStatus(404)
            break
        }
        case StatusesCode.InvalidCredentials
        || StatusesCode.InvalidToken: {
            console.error(result.errorMessage)
            res.sendStatus(401)
            break
        }
        default: {
            console.error('some uncaught error')
            res.sendStatus(520)
        }
    }
}