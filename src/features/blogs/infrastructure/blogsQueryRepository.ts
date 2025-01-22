import {ObjectId, WithId} from 'mongodb';
import {IdQueryDbType} from '../../../types/db/query-db-types';
import {
    BlogId,
    BlogsSortViewModel,
    BlogViewModel,
    PostsForBlogSortViewModel
} from '../../../types/entities/blogs-types';
import {BlogDbType, BlogsQueryDBType} from '../../../types/db/blog-db-types';
import {sortQueryFieldsUtils} from '../../../common/utils/sortQueryFields.utils';
import {SortOutputQueryType} from '../../../types/utils/sort-types';
import {result, ResultType} from '../../../common/utils/errorsAndStatusCodes.utils';
import {inject, injectable} from 'inversify';
import {BlogModel} from '../domain/blogEntity';
import {PostsQueryRepository} from '../../posts/infrastructure/postsQueryRepository';
import {UserId} from '../../../types/entities/users-types';

@injectable()
export class BlogsQueryRepository {
    constructor(
        @inject(PostsQueryRepository) protected postsQueryRepository: PostsQueryRepository
    ) {
    }

    private toIdQuery(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    }

    private mapToBlogViewModel(blog: WithId<BlogDbType>): BlogViewModel {
        return {
            id: blog._id.toString(),
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
            createdAt: blog.createdAt.toISOString(),
            isMembership: blog.isMembership
        }
    }

    async isBlogFound(blogId: BlogId): Promise<boolean> {
        const blog: number = await BlogModel.countDocuments(this.toIdQuery(blogId));

        return !!blog
    }

    async findAndMap(id: BlogId): Promise<ResultType<BlogViewModel>> {
        const blog: WithId<BlogDbType> | null = await BlogModel.findOne(this.toIdQuery(id))

        if (blog) {
            return result.success(this.mapToBlogViewModel(blog))
        } else {
            return result.notFound('blog not found')
        }
    }

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
            items: blogs.map(blog => this.mapToBlogViewModel(blog))
        }
    }

    // async sortPostsInBlog(blogId: BlogId, query: any): Promise<PostsSortViewModel> {
    //     return postsQueryRepository.sortPosts(query, blogId)
    // },

    async getSortedPostsInBlog(blogId: BlogId, query: any, userId: UserId | null): Promise<PostsForBlogSortViewModel> {
        return this.postsQueryRepository.getAllSortedPosts(query, userId, blogId)
    }
}