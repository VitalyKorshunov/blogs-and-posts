declare namespace Express {
    export interface Request {
        user: { id: string, deviceId?: string} | undefined
    }
}
