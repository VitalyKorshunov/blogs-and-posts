import {SortInputQueryType, SortOutputQueryType} from '../../types/utils/sort-types';


export const sortQueryFieldsUtils = (query: SortInputQueryType): SortOutputQueryType => {
    const sortBy =
        query.sortBy
            ? query.sortBy
            : 'createdAt'

    const sortDirection =
        ['asc', 'desc'].includes(query.sortDirection)
            ? query.sortDirection
            : 'desc'

    const pageNumber =
        !isNaN(query.pageNumber)
            ? Number(query.pageNumber)
            : 1

    const pageSize =
        !isNaN(query.pageSize)
        || Number(query.pageSize) >= 1      //min 1
        || Number(query.pageSize) <= 100    //max 100
            ? Number(query.pageSize)
            : 10

    const countSkips = (pageNumber - 1) * query.pageSize

    return {
        sortBy,
        sortDirection,
        countSkips,
        pageSize,
        pageNumber
    }
}
