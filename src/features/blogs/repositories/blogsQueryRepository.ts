import {BlogModel, PostModel} from '../../../db/mongo-db';
import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {
    BlogId,
    BlogsSortViewModel,
    BlogViewModel,
    PostsForBlogSortViewModel
} from '../../../types/entities/blogs-types';
import {PostViewModel} from '../../../types/entities/posts-types';
import {BlogDbType, BlogsQueryDBType, PostsForBlogQueryDbType} from '../../../types/db/blog-db-types';
import {sortQueryFieldsUtils} from '../../../common/utils/sortQueryFields.utils';
import {SortOutputQueryType} from '../../../types/utils/sort-types';
import {PostDbType} from '../../../types/db/post-db-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';


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
    _mapToPostViewModel(post: WithId<PostDbType>): PostViewModel {
        return {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt.toISOString()
        }
    },


    async isBlogFound(blogId: BlogId): Promise<boolean> {
        const blog: number = await BlogModel.countDocuments(this._toIdQuery(blogId));

        return !!blog
    },
    async findAndMap(id: BlogId): Promise<ResultType<BlogViewModel>> {
        const blog: WithId<BlogDbType> | null = await BlogModel.findOne(this._toIdQuery(id))

        if (blog) {
            return result.success(this._mapToBlogViewModel(blog))
        } else {
            return result.notFound('blog not found')
        }
    },
    async getAllSortedBlogs(query: any): Promise<BlogsSortViewModel> {
        const sortQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query)
        const filter: BlogsQueryDBType = {
            ...sortQueryFields,
            searchNameTerm: query.searchNameTerm ? {name: {$regex: query.searchNameTerm, $options: 'i'}} : {},
        }
        const blogs = await BlogModel
            .find(filter.searchNameTerm)
            .sort({[filter.sortBy]: filter.sortDirection})
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .lean()

        const totalPosts = await BlogModel.countDocuments(filter.searchNameTerm)
        const pagesCount = Math.ceil(totalPosts / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPosts,
            items: blogs.map(blog => this._mapToBlogViewModel(blog))
        }
    },
    // async sortPostsInBlog(blogId: BlogId, query: any): Promise<PostsSortViewModel> {
    //     return postsQueryRepository.sortPosts(query, blogId)
    // },

    async getSortedPostsInBlog(blogId: BlogId, query: any): Promise<ResultType<PostsForBlogSortViewModel>> {
        const blogObjectId: ObjectId | null = new ObjectId(blogId)
        const isBlogFound = await this.isBlogFound(blogId)

        if (!isBlogFound) return result.notFound('blog not found')

        const queryFindAllPostsForBlog = {blogId: blogObjectId}

        const sortedQueryFields: SortOutputQueryType = sortQueryFieldsUtils(query)
        const filter: PostsForBlogQueryDbType = {
            ...sortedQueryFields,
        }

        const posts = await PostModel
            .find(queryFindAllPostsForBlog, {__v: 0})
            .sort({[filter.sortBy]: filter.sortDirection})
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .lean()

        const totalPostsCount = await PostModel.countDocuments(queryFindAllPostsForBlog)
        const pagesCount = Math.ceil(totalPostsCount / filter.pageSize)

        const data: PostsForBlogSortViewModel = {
            pagesCount: pagesCount,
            page: filter.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPostsCount,
            items: posts.map(post => this._mapToPostViewModel(post))
        }

        return result.success(data)
    },
}