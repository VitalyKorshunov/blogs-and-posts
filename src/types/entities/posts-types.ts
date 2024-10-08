export type PostId = string

export type PostInputModel = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type PostViewModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: string
}

export type PostServiceModel = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: Date
}

export type PostsSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: PostViewModel[]
}

export type BlogPostInputModel = {
    title: string
    shortDescription: string
    content: string
}

export type PostCreateType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
    createdAt: Date
}

export type PostUpdateType = {
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
}