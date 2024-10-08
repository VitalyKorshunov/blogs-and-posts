export type BlogId = string

export type BlogInputModel = {
    name: string
    description: string
    websiteUrl: string
}

export type BlogViewModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogServiceModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: Date
    isMembership: boolean
}

export type BlogsSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: BlogViewModel[]
}

export type BlogCreateType = {
    name: string
    description: string
    websiteUrl: string
    createdAt: Date
    isMembership: boolean
}

export type BlogUpdateType = {
    name: string
    description: string
    websiteUrl: string
}