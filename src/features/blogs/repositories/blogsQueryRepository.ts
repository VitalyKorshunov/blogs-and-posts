import {BlogDbType} from '../../../db/blog-db-type'
import {blogCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType} from '../../../db/query-db-type';
import {BlogId, BlogsSortViewModel, BlogViewModel} from '../../../input-output-types/blogs-types';
import {BlogsQueryDBType} from '../some';
import {postsQueryRepository} from '../../posts/repositories/postsQueryRepository';
import {PostsSortViewModel} from '../../../input-output-types/posts-types';

export const blogsQueryRepository = {
    getValidQueryId(id: string): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    map(blog: BlogDbType) {
        const blogForOutput: BlogViewModel = {
            id: blog._id.toString(),
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            name: blog.name,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership
        }
        return blogForOutput
    },

    async find(id: BlogId): Promise<BlogDbType | null> {
        return await blogCollection.findOne(this.getValidQueryId(id));
    },
    async findAndMap(id: BlogId): Promise<BlogViewModel> {
        const blog: BlogDbType | null = await this.find(id)

        if (blog) {
            return this.map(blog)
                    } else {
            throw new Error('blog not found (blogsQueryRepository.findAndMap)')
        }
    },
    async getAll(query: any): Promise<BlogsSortViewModel> {
        const filter: BlogsQueryDBType = {
            searchNameTerm: query.searchNameTerm ? {name: {$regex: query.searchNameTerm, $options: 'i'}} : {},
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10
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
            items: blogs.map(blog => this.map(blog))
        }
    },
    async sortPostsInBlog(blogId: BlogId, query: any): Promise<PostsSortViewModel> {
        return postsQueryRepository.sortPosts(query, blogId)
    },
}