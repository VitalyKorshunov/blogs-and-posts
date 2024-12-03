export class BlogDbType {
    constructor(
        // public _id: ObjectId,
        public name: string,
        public description: string,
        public websiteUrl: string,
        public createdAt: Date,
        public isMembership: boolean) {
    }
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