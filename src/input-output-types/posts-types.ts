export type PostInputModel = {
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: string // valid
}

export type BlogPostInputModel = {
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
}

export type PostId = string

export type PostViewModel = {
    id: string
    title: string // max 30
    shortDescription: string // max 100
    content: string // max 1000
    blogId: string // valid
    blogName: string
    createdAt: string
}

export type PostsQueryDbType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type PostsSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: PostViewModel[]
}