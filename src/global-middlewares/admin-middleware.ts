import {NextFunction, Request, Response} from 'express'
import {SETTINGS} from '../settings'

export const base64EncodeAndDecode = {
    decodeFromBase64ToUTF8(code: string) {
        const buff = Buffer.from(code, 'base64')
        const decodedAuth = buff.toString('utf8')
        return decodedAuth
    },
    encodeFromUTF8ToBase64(code: string) {
        const buff2 = Buffer.from(code, 'utf8')
        const codedAuth = buff2.toString('base64')
        return codedAuth
    }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers['authorization'] as string // 'Basic xxx' or 'Bearer xxx.xxx.xxx'

    if (!auth) {
        res
            .status(401)
            .json({})
        return
    }

    if (auth.slice(0, 6) !== 'Basic ') {
        res
            .status(401)
            .json({})
        return
    }

    const decodedAuth = base64EncodeAndDecode.decodeFromBase64ToUTF8(auth.slice(6))
    // const codedAuth = base64EncodeAndDecode.encodeFromUTF8ToBase64(SETTINGS.ADMIN)

    if (decodedAuth !== SETTINGS.ADMIN) {
        res
            .status(401)
            .json({})
        return
    }


    next()
}