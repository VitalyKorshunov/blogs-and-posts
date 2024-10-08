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