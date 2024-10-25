import {NextFunction, Request, Response} from 'express'
import {validationResult} from 'express-validator'
import {ErrorsType} from '../types/utils/output-errors-type';

// export const inputCheckErrorsMiddleware = (req: Request, res: Response<OutputErrorsType>, next: NextFunction) => {
//     const e = validationResult(req)
//     if (!e.isEmpty()) {
//         const eArray = e.array({onlyFirstError: true}) as { path: FieldNamesType, msg: string }[]
//
//         res
//             .status(400)
//             .json({
//                 errorsMessages: eArray.map(x => ({field: x.path, message: x.msg}))
//             })
//         return
//     }
//
//     next()
// }

export const inputCheckErrorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req)
    const errors = result.array({onlyFirstError: true})

    if (errors.length) {
        const customFormatErrors: ErrorsType =
            {
                errorsMessages:
                    errors.map(e => {
                        return {
                            field: (e as any).path,
                            message: e.msg
                        }
                    })
            }

        res.status(400).json(customFormatErrors)
    } else {
        next()
    }
}