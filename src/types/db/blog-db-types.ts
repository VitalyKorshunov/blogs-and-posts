export interface BlogDbType {
    name: string
    description: string
    websiteUrl: string
    createdAt: Date
    isMembership: boolean
}

export type BlogsQueryDBType = {
    searchNameTerm: Object
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type PostsForBlogQueryDbType = {
    pageNumber: number
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}