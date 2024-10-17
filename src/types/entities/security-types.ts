export type DeviceId = string
export type DeviceName = string
export type IP = string

export type SecurityViewModel = {
    ip: string
    title: string
    lastActiveDate: string
    deviceId: string
}

export type SecurityInputModel = {
    userId: string
    deviceId: string
    lastActiveDate: Date
    deviceName: string
    ip: string
    expireDate: Date
}

export type SecurityUpdateType = {
    deviceId: string
    lastActiveDate: Date
    expireDate: Date
}

export type SecurityServiceModel = {
    id: string
    userId: string
    deviceId: string
    lastActiveDate: Date
    deviceName: string
    ip: string
    expireDate: Date
}

export type SecuritySessionSearchQueryType = {
    deviceId: string
    lastActiveDate: Date
}