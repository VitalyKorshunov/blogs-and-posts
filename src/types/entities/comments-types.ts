export type CommentId = string

export type CommentInputModel = {
    content: string
}

export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export type CommentServiceType = {
    id: string
    content: string
    postId: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export type CommentsSortViewModel = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: CommentViewModel[]
}

export type CommentCreateType = {
    content: string
    postId: string
    commentatorInfo: {
        userId: string
        userLogin: string
    }
    createdAt: string
}

export type CommentUpdateType = {
    content: string
}