import {SortInputQueryType, SortOutputQueryType} from '../../types/sort-filter-pagination/sort-types';


export const sortQueryFieldsUtils = (query: SortInputQueryType): SortOutputQueryType => {
    const sortBy = query.sortBy ? query.sortBy : 'createdAt'
    const sortDirection = ['asc', 'desc'].includes(query.sortDirection) ? query.sortDirection : 'desc'
    const countSkips = !isNaN(query.pageNumber) ? Number((query.pageNumber - 1) * query.pageSize) : 0
    const pageSize = !isNaN(query.pageSize) ? Number(query.pageSize) : 10

    return {
        sortBy,
        sortDirection,
        countSkips,
        pageSize
    }
}
