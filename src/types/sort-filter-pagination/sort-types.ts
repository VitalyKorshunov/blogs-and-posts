export type SortInputQueryType = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type SortOutputQueryType = {
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

