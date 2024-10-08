import {blogCollection} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {BlogId, BlogsSortViewModel, BlogViewModel} from '../../../types/entities/blogs-types';
import {postsQueryRepository} from '../../posts/repositories/postsQueryRepository';
import {PostsSortViewModel} from '../../../types/entities/posts-types';
import {BlogDbType, BlogsQueryDBType} from '../../../types/db/blog-db-types';
import {sortQueryFieldsUtils} from '../../../common/utils/sortQueryFields.utils';
import {SortOutputQueryType} from '../../../types/sort-filter-pagination/sort-types';

export const blogsQueryRepository = {
    _toIdQuery(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    _mapToBlogViewModel(blog: WithId<BlogDbType>): BlogViewModel {
        return {
            id: blog._id.toString(),
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership
        }
    },


    async isBlogFound(id: BlogId): Promise<boolean> {
        const blog: number = await blogCollection.countDocuments(this._toIdQuery(id));

        return !!blog
    },
    async findAndMap(id: BlogId): Promise<BlogViewModel> {
        const blog: WithId<BlogDbType> | null = await blogCollection.findOne(this._toIdQuery(id))

        if (blog) {
            return this._mapToBlogViewModel(blog)
        } else {
            throw new Error('blog not found (blogsQueryRepository.findAndMap)')
        }
    },
    async getAll(query: any): Promise<BlogsSortViewModel> {
        const sortQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query)
        const filter: BlogsQueryDBType = {
            ...sortQueryFields,
            searchNameTerm: query.searchNameTerm ? {name: {$regex: query.searchNameTerm, $options: 'i'}} : {},
        }
        const blogs = await blogCollection
            .find(filter.searchNameTerm)
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalPosts = await blogCollection.countDocuments(filter.searchNameTerm)
        const pagesCount = Math.ceil(totalPosts / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPosts,
            items: blogs.map(blog => this._mapToBlogViewModel(blog))
        }
    },
    async sortPostsInBlog(blogId: BlogId, query: any): Promise<PostsSortViewModel> {
        return postsQueryRepository.sortPosts(query, blogId)
    },
}