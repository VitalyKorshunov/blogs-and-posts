import {PostDbType} from '../../../db/post-db-type'
import {postCollection} from '../../../db/mongo-db';
import {ObjectId} from 'mongodb';
import {IdQueryDbType,} from '../../../db/query-db-type';
import {PostId, PostsQueryDbType, PostsSortViewModel, PostViewModel} from '../../../input-output-types/posts-types';
import {BlogId,} from '../../../input-output-types/blogs-types';

export const postsQueryRepository = {
    getValidQueryId(id: PostId): IdQueryDbType {
        return {_id: new ObjectId(id)}
    },
    map(post: PostDbType) {
        const postForOutput: PostViewModel = {
            id: post._id.toString(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId.toString(),
            blogName: post.blogName,
            createdAt: post.createdAt
        }
        return postForOutput
    },

    async find(postId: PostId): Promise<PostDbType | null> {
        return await postCollection.findOne(this.getValidQueryId(postId))
    },
    async findAndMap(postId: PostId): Promise<PostViewModel> {
        const post: PostDbType | null = await this.find(postId)

        if (post) {
            return this.map(post)
        } else {
            throw new Error('post not found (postsQueryRepository.findAndMap)')
        }
    },
    async getAll(query: any): Promise<PostsSortViewModel> {
        return await this.sortPosts(query)
    },
    async sortPosts(query: any, blogId?: BlogId): Promise<PostsSortViewModel> {
        //todo: оставить универсальный метод для использования в blogsQueryRepository или продублировать его там же?
        // Универсальность достигнута с помощью необязательного blogId
        const blogValidDbId: ObjectId | null = blogId ? this.getValidQueryId(blogId)._id : null
        const findFilter = blogValidDbId ? {blogId: blogValidDbId} : {}

        const filter: PostsQueryDbType = {
            sortBy: query.sortBy ? query.sortBy : 'createdAt',
            sortDirection: query.sortDirection ? query.sortDirection : 'desc',
            countSkips: query.pageNumber ? (query.pageNumber - 1) * query.pageSize : 0,
            pageSize: query.pageSize ? query.pageSize : 10
        }
        const posts = await postCollection
            .find(findFilter)
            .sort(filter.sortBy, filter.sortDirection)
            .skip(filter.countSkips)
            .limit(filter.pageSize)
            .toArray()

        const totalPosts = await postCollection.countDocuments(findFilter)
        const pagesCount = Math.ceil(totalPosts / filter.pageSize)

        return {
            pagesCount: pagesCount,
            page: query.pageNumber,
            pageSize: filter.pageSize,
            totalCount: totalPosts,
            items: posts.map(post => this.map(post))
        }
    },
}
