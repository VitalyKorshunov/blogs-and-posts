import {Request, Response} from 'express'

export type ParamType = {
    id: string
}

export type BodyType = {
    id: number
    title: string
    // ...
}

export type SortQueryType = {
    pageNumber: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type BlogsQueryDBType = {
    searchNameTerm: Object
    countSkips: number
    pageSize: number
    sortBy: string
    sortDirection: 'asc' | 'desc'
}

export type OutputType = void /*| OutputErrorsType | OutputVideoType*/

export const someController = (
    req: Request<ParamType, OutputType, BodyType, SortQueryType>,
    res: Response<OutputType>
) => {

}